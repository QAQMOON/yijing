import { useEffect, useState } from 'react';
import { getStorageItem, setStorageItem } from '../utils/safeStorage.js';
import styles from './PwaInstallPrompt.module.css';

const DISMISS_KEY = 'yijie-pwa-install-dismissed';

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;
}

export default function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStorageItem(DISMISS_KEY) === '1' || isStandalone()) return undefined;

    const handlePrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  if (!visible || !promptEvent) return null;

  const install = async () => {
    setVisible(false);
    await promptEvent.prompt();
    setPromptEvent(null);
  };

  const dismiss = () => {
    setStorageItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <aside className={styles.prompt} role="status">
      <div>
        <strong>安装易解</strong>
        <span>添加到手机桌面，排盘和查看报告更顺手。</span>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={install}>安装</button>
        <button type="button" onClick={dismiss}>稍后</button>
      </div>
    </aside>
  );
}
