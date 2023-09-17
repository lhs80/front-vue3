import fs from "fs";
import {dayjs} from "element-plus";
//返回package的json数据
const getPackageJson = () => {
  const data = fs.readFileSync("./package.json"); //fs读取文件
  return JSON.parse(data.toString()); //转换为json对象
};

const packageData: Record<string, string> = getPackageJson();

// 新版本号写入
const saveVersion = () => {
  fs.writeFile("./package.json", JSON.stringify(packageData, null, "\t"), (err) => {
    if (err) {
      console.log("写入失败", err);
    } else {
      console.log("版本号写入成功");
    }
  });
};

// 生成新的版本号
const changeVersion = () => {
  const vb = packageData.version.split("B");
  let version = vb[0];
  let arr = version.split("."); //切割后的版本号数组
  arr[2] = parseInt(arr[2]) + 1 + ""; //第3位版本号累加
  if (arr.length > 3) {
    arr.splice(3, 1);
  }
  packageData.version = arr.join(".") + `.B${dayjs().format("YYMMDD")}`;
};

changeVersion();
saveVersion();
