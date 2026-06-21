import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const host = '127.0.0.1';
const port = process.env.E2E_PORT || '4173';
const usesExternalBaseUrl = Boolean(process.env.BASE_URL);
const baseUrl = process.env.BASE_URL || `http://${host}:${port}`;
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const playwrightCli = path.join(rootDir, 'node_modules', '@playwright', 'test', 'cli.js');
const generateSitemapScript = path.join(rootDir, 'scripts', 'generate-sitemap.mjs');
const prerenderScript = path.join(rootDir, 'scripts', 'prerender-static.mjs');

class CommandError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = 'CommandError';
    this.exitCode = exitCode;
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      ...options,
      env: {
        ...process.env,
        ...(options.env || {}),
      },
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      const detail = signal ? `signal ${signal}` : `exit code ${code}`;
      reject(new CommandError(`${command} ${args.join(' ')} failed with ${detail}`, code || 1));
    });
  });
}

function startPreview() {
  return spawn(process.execPath, [
    viteBin,
    'preview',
    '--host',
    host,
    '--port',
    port,
    '--strictPort',
  ], {
    cwd: rootDir,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: process.env,
  });
}

async function runBuild() {
  await runCommand(process.execPath, [generateSitemapScript]);
  await runCommand(process.execPath, [viteBin, 'build']);
  await runCommand(process.execPath, [prerenderScript]);
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (response.ok) return;
        lastError = new Error(`HTTP ${response.status}`);
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(`Preview server did not become ready at ${url}: ${lastError?.message || 'timeout'}`);
}

async function isServerReady(url) {
  try {
    await waitForServer(url, 1000);
    return true;
  } catch {
    return false;
  }
}

function waitForPreview(child, url) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      child.off('error', onError);
      child.off('exit', onExit);
      callback(value);
    };
    const onError = (error) => {
      finish(reject, new Error(`Preview server failed to start: ${error.message}`));
    };
    const onExit = (code, signal) => {
      const detail = signal ? `signal ${signal}` : `exit code ${code}`;
      finish(reject, new Error(`Preview server exited early with ${detail}`));
    };

    child.once('error', onError);
    child.once('exit', onExit);
    waitForServer(url).then(
      () => finish(resolve),
      (error) => finish(reject, error),
    );
  });
}

function stopPreview(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
    }, 3000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill();
  });
}

async function main() {
  let server;

  try {
    if (!usesExternalBaseUrl) {
      await runBuild();
      if (await isServerReady(baseUrl)) {
        throw new Error(`Preview URL ${baseUrl} is already in use; stop the existing server or set E2E_PORT.`);
      }

      server = startPreview();
      await waitForPreview(server, baseUrl);
    } else {
      await waitForServer(baseUrl);
    }

    await runCommand(process.execPath, [
      playwrightCli,
      'test',
      ...process.argv.slice(2),
    ], {
      env: {
        BASE_URL: baseUrl,
      },
    });
  } catch (error) {
    console.error(`[e2e] ${error.message}`);
    process.exitCode = error.exitCode || 1;
  } finally {
    await stopPreview(server);
  }
}

await main();
