function storageAvailable() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function getStorageItem(key) {
  if (!storageAvailable()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key, value) {
  if (!storageAvailable()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key) {
  if (!storageAvailable()) return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
