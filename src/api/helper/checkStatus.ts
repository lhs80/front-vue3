import {ElMessage} from "element-plus";
import {showNotify} from 'vant';
import {clearToken} from "@/utils/auth";

/**
 * @description: 校验网络请求状态码
 * @param {Number} status
 * @param {String} message
 * @return void
 */
let msgBox = null;
export const checkStatus = (status: number, message: string) => {
  switch (status) {
    case 401:
    case 113 :
    case 403 :
    case 110 :
      if (msgBox) return;
      showMessageBox(message);
      setTimeout(() => {
        window.location.href = '/';
        clearToken();
      }, 1000);
      break;
    default:
      if (msgBox) return;
      showMessageBox(message)
  }
};

//判断终端类型，显示对应的提示框
const showMessageBox = (content) => {
  const {platform} = window.navigator, system = {};
  system.win = platform.toLowerCase().indexOf('win') === 0;
  system.mac = platform.toLowerCase().indexOf('mac') === 0;
  if (system.win || system.mac) {
    msgBox = ElMessage({
      message: content,
      type: 'error',
      onClose: () => {
        msgBox = null
      }
    });
  } else {
    msgBox = showNotify({
      message: content,
      type: 'danger',
      onClose: () => {
        msgBox = null
      }
    });
  }
};