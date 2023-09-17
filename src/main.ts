import { createApp } from "vue";
// @ts-ignore
import App from "./App.vue";
import router from "./router/index";
import infiniteScroll from "vue-infinite-scroll";
import "virtual:svg-icons-register";
import "element-plus/dist/index.css";
import 'vant/lib/index.css';
import '@xsykj/base-ui/dist/style.css'
import "./assets/fonts/iconfont.js";
import "./assets/fonts/iconfont.css";
const app = createApp(App);
app.use(router);
app.use(infiniteScroll);
app.mount("#app");
