/*
 * @Description:
 * @Author: chenjiaxin
 * @Date: 2022-07-17 20:45:01
 * @LastEditTime: 2022-07-19 22:33:43
 * @FilePath: \rollup-plugin-compression\src\index.ts
 */
import { cwd } from "node:process";
import path from "path";
import compressing from "compressing";
import fs from "fs";

// @ts-ignore
import config from "../../../package.json";

const { name, version } = config;
const zipName = name.split("-")[0];

export interface ICompressionOptions {
  sourceName: string;
  type?: "zip" | "tar";
  targetName?: string;
}

const defaultOption: ICompressionOptions = {
  sourceName: config.version,
  type: "zip",
  targetName: `${zipName}_${version}`,
};

// 删除目录及目录中的所有目录和文件
const deleteDir = (targetPath: string) => {
  // 判断路径是否存在
  if (!fs.existsSync(targetPath)) return;
  if (fs.statSync(targetPath).isDirectory()) {
    fs.rmSync(targetPath, { recursive: true }); // 是目录则递归删除
  } else {
    fs.unlinkSync(targetPath); //不是目录则为文件
  }
};

// 删除指定目录下的指定文件
const deleteDirFile = (targetPath: string, buildType: string) => {
  const rootPathFiles = fs.readdirSync(targetPath);
  rootPathFiles.forEach((file: any) => {
    const currentPath = path.resolve(targetPath, file);
    if (fs.statSync(currentPath).isFile()) {
      const extname = path.extname(file); // 获取文件扩展名
      if (extname === `.${buildType}`) {
        fs.unlinkSync(currentPath); //删除指定扩展名的文件
      }
    }
  });
};

const compressionBuild = (options: ICompressionOptions = defaultOption) => {
  Object.assign(defaultOption, options);
  const { sourceName, type, targetName } = defaultOption;
  console.log(sourceName, type, targetName);
  // const sourceName = options.sourceName ?? "dist";
  // const type = options.type ?? "zip";
  // const targetName = options.targetName ?? "dist";
  const rootPath = cwd();
  const buildPath = path.resolve(rootPath, sourceName);
  return {
    name: "compression",
    buildStart() {
      console.log("build start....");
      deleteDir(buildPath); //删除build构建目录
      deleteDirFile(rootPath, type); //删除上一次的打包压缩文件
    },
    closeBundle() {
      console.log("closeBundle");
      compressing.zip
        .compressDir(buildPath, `${targetName}.${type}`,{
          ignoreBase: true//忽略文件夹，直接打包文件
        })
        .then(() => {
          console.log(`${targetName}.${type} compress completed!`);
        })
        .catch((err: unknown) => {
          console.log(`compress error`, err);
        });
    },
  };
};
export default compressionBuild;
