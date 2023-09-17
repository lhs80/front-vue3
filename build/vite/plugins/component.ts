/**
 * @name  AutoRegistryComponents
 * @description 按需加载，自动引入组件
 */

// @ts-ignore
import Components from "unplugin-vue-components/vite";
// @ts-ignore
import {ElementPlusResolver, VueUseComponentsResolver, VantResolver} from "unplugin-vue-components/resolvers";

export const AutoRegistryComponents = () => {
  return Components({
    dirs: ["src/components"],
    extensions: ["vue", "md"],
    deep: true,
    dts: "types/components.d.ts",
    directoryAsNamespace: false,
    globalNamespaces: [],
    directives: true,
    include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
    resolvers: [
      ElementPlusResolver(),
      VueUseComponentsResolver(),
      VantResolver(),
      (componentName: string) => {
        if (componentName.startsWith('X')) {
          return {name: componentName, from: '@xsykj/base-ui'}
        }
        if (componentName==='XsyVideo') {
          return {name: componentName, from: '@xsykj/video'}
        }
      }],
  });
};
