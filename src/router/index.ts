import {createRouter, createWebHashHistory, RouterOptions} from "vue-router";
import { setupLayouts } from "virtual:generated-layouts";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import routes from "~pages";

//导入生成的路由数据
const router = createRouter(<RouterOptions>{
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (_to, _from, next) => {
  NProgress.start();
  next();
});

router.afterEach((_to) => {
  NProgress.done();
});

export default router;
