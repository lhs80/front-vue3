快速搭建应用的 Vue3 + Vite4.0 + TypeScript + Pinia 模板框架。集成了各类插件，并进行了模块化和按需加载的优化。

<p align="center">
    <img src="https://img.shields.io/badge/-Vue3-34495e?logo=vue.js" />
    <img src="https://img.shields.io/badge/-Vite4.0-646cff?logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/-TypeScript-blue?logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/-Pinia-yellow?logo=picpay&logoColor=white" />
    <img src="https://img.shields.io/badge/-ESLint-4b32c3?logo=eslint&logoColor=white" />
    <img src="https://img.shields.io/badge/-Axios-008fc7?logo=axios&logoColor=white" />
    <img src="https://img.shields.io/badge/-Prettier-ef9421?logo=Prettier&logoColor=white" alt="Prettier">
    <img src="https://img.shields.io/badge/-Less-1D365D?logo=less&logoColor=white" alt="Less"> 
    <img src="https://img.shields.io/badge/-Mitt-green" alt="Mitt">
    <img src="https://img.shields.io/badge/-Dayjs-C86CFF" alt="Moment">
</p>

# 已有功能

- 支持 svg 图标,已封装一个简单的 SvgIcon 组件,可以直接读取文件下的 svg
- 支持 axios(ts 版),已封装了拦截器，请求调用等方法
- 支持 env,环境变量和区分打包环境
- 支持 unplugin-vue-components 组件自动引入
- 支持 unplugin-auto-import 按需自动导入 API
- 支持 vite-plugin-pages 根据文件自动生成路由的插件
- 支持打包自动修改 package 中的版本号,并以版本号命名，生成 zip 压缩包

# JS 库

- mitt 全局事件监听库，Vue3 官方推荐
- dayjs 一个轻量级的 Javascript 时间库
- pdfh5 用于加载 pdf 的插件
- prettier 前端代码格式化工具
- 支持 vueuse 基于 Composition API 的实用函数集合

# UI 库

- PC 端：element-plus
- 移动端：Vant UI

# 快速开始

```shell
npm install
```

运行命令

```shell
npm run dev
```
