import {API_BASE_URL, API_TARGET_URL} from "../constant";
import {ProxyOptions} from "vite";

type ProxyTargetList = Record<string, ProxyOptions>;

export function createViteProxy() {
  const viteProxy: ProxyTargetList = {};
  API_BASE_URL.map(url => {
    viteProxy[url] = {
      target: API_TARGET_URL,
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(new RegExp(`^${url}`), ""),
    }
  });
  return viteProxy;
}