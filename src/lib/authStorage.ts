const REMEMBER_AUTH_KEY = "scriativa-auth-remember";

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function setAuthRememberPreference(remember: boolean) {
  const local = getLocalStorage();
  const session = getSessionStorage();

  if (remember) {
    local?.setItem(REMEMBER_AUTH_KEY, "true");
    session?.removeItem(REMEMBER_AUTH_KEY);
    return;
  }

  session?.setItem(REMEMBER_AUTH_KEY, "false");
  local?.removeItem(REMEMBER_AUTH_KEY);
}

export function clearAuthRememberPreference() {
  getLocalStorage()?.removeItem(REMEMBER_AUTH_KEY);
  getSessionStorage()?.removeItem(REMEMBER_AUTH_KEY);
}

function shouldRememberAuth() {
  const local = getLocalStorage();
  const session = getSessionStorage();

  if (local?.getItem(REMEMBER_AUTH_KEY) === "true") return true;
  if (session?.getItem(REMEMBER_AUTH_KEY) === "false") return false;

  return true;
}

export const supabaseAuthStorage = {
  getItem(key: string) {
    const local = getLocalStorage();
    const session = getSessionStorage();

    if (shouldRememberAuth()) {
      return local?.getItem(key) ?? session?.getItem(key) ?? null;
    }

    return session?.getItem(key) ?? null;
  },
  setItem(key: string, value: string) {
    const local = getLocalStorage();
    const session = getSessionStorage();

    if (shouldRememberAuth()) {
      local?.setItem(key, value);
      session?.removeItem(key);
      return;
    }

    session?.setItem(key, value);
    local?.removeItem(key);
  },
  removeItem(key: string) {
    getLocalStorage()?.removeItem(key);
    getSessionStorage()?.removeItem(key);
  }
};
