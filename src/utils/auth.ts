const TokenKey = "xsy_user_info";
const isLogin = sessionStorage.getItem(TokenKey);
const getToken = () => {
  return JSON.parse(<string>sessionStorage.getItem(TokenKey));
};
const setToken = (info: object) => {
  sessionStorage.setItem(TokenKey, JSON.stringify(info));
};
const clearToken = () => {
  sessionStorage.removeItem(TokenKey);
};
export {isLogin, getToken, setToken, clearToken};
