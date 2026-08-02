export function getStorageItem(key, userId) {
  if (typeof window === 'undefined') return null;
  if (userId) {
    const val = localStorage.getItem(`${key}_${userId}`);
    if (val) return val;
  }
  return sessionStorage.getItem(key);
}

export function setStorageItem(key, value, userId) {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.setItem(`${key}_${userId}`, value);
  } else {
    sessionStorage.setItem(key, value);
  }
}

export function removeStorageItem(key, userId) {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.removeItem(`${key}_${userId}`);
  }
  sessionStorage.removeItem(key);
}
