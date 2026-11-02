// localStorage throws when a browser blocks site storage, so settings are read and saved
// through these, which fall back to not remembering anything.

export function readSetting(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveSetting(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The setting lasts until the page is closed
  }
}
