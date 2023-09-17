const tokenKey = "xsy_config_info";

export function getAppInfo() {
  return JSON.parse(<string>sessionStorage.getItem(tokenKey));
}

export function setAppInfo(data:object) {
  sessionStorage.setItem(tokenKey, JSON.stringify(data));
}

export function removeAppInfo() {
  return sessionStorage.removeItem(tokenKey);
}

