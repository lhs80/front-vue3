/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import {PluginOption} from "vite";
import vue from "@vitejs/plugin-vue";
import {ViteEjsPlugin} from 'vite-plugin-ejs'
import {ConfigSvgIconsPlugin} from "./svgIcons";
import {AutoRegistryComponents} from "./component";
import {AutoImportDeps} from "./autoImport";
import {ConfigPagesPlugin} from "./pages";
import {ConfigRestartPlugin} from "./restart";
import compressionBuild from "./compress";
import Layouts from 'vite-plugin-vue-layouts';
import legacy from '@vitejs/plugin-legacy'
import babel from 'vite-plugin-babel';
import esbuild from 'rollup-plugin-esbuild'
export function createVitePlugins(isBuild: boolean) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // vue支持
    vue(),
    ViteEjsPlugin(),
    Layouts({
      layoutsDirs: 'src/views/layout',
      defaultLayout: 'index',
    }),
    legacy({
      targets: ['chrome >= 73', 'not IE 11'],
    }),
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator']
      }
    }),
    {
      ...esbuild({
        target: 'chrome70',
        // 如有需要可以在这里加 js ts 之类的其他后缀
        include: /\.vue$/,
        loaders: {
          '.vue': 'js',
        },
      }),
      enforce: 'post',
    }
  ];

  // 自动按需引入组件
  vitePlugins.push(AutoRegistryComponents());

  // 自动按需引入依赖
  vitePlugins.push(AutoImportDeps());

  // 自动生成路由
  vitePlugins.push(ConfigPagesPlugin());

  // 监听配置文件改动重启
  vitePlugins.push(ConfigRestartPlugin());

  // vite-plugin-svg-icons
  vitePlugins.push(ConfigSvgIconsPlugin(isBuild));

  vitePlugins.push(compressionBuild());

  return vitePlugins;
}
