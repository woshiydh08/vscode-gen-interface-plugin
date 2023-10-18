import * as fs from 'fs';
import * as path from 'path';

/**
 * 将字符串的首字母大写
 * @param str 输入的字符串
 * @returns 首字母大写后的字符串
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateRequestInterface(
  comment: string,
  functionName: string
) {
  return `/** ${comment}参数 */
export interface ${capitalizeFirstLetter(functionName)}Request {

}`;
}

export function generateResponseInterface(
  comment: string,
  functionName: string
) {
  return `/** ${comment}响应 */
export interface ${capitalizeFirstLetter(functionName)}Response {

}`;
}

/**
 * 生成接口定义
 * @param comment 注释名
 * @param functionName 函数名
 * @returns 接口定义的字符串
 */
export function generateInterface(
  comment: string,
  functionName: string
): string {
  /** 定义请求参数接口 */
  const requestInterface = generateRequestInterface(comment, functionName);
  /** 定义响应结果接口 */
  const responseInterface = generateResponseInterface(comment, functionName);

  return requestInterface + responseInterface;
}

/**
 * 解析给定的文件路径并获取文件内容
 * @param file JavaScript文件的路径
 * @returns
 */
export function readFileContent(file: string): string {
  const filePath = path.resolve(file);
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 获取接口文件的路径
 * @param sourceFilePath ts文件的路径
 * @returns 接口文件的路径
 */
export function getInterfaceFilePath(sourceFilePath: string) {
  const interfaceFileName = `${path.parse(sourceFilePath).name}.type.ts`;
  // 定义TypeScript文件的输出路径
  const interfaceFilePath = path.join(sourceFilePath, '..', interfaceFileName);
  return interfaceFilePath;
}

/**
 * 辅助函数：找到接口的结尾位置
 * @param code 源代码字符串
 * @param startIndex 接口起始位置的索引
 * @returns 接口的结尾位置的索引，如果找不到则返回 -1
 */
export function findInterfaceEndIndex(
  code: string,
  startIndex: number
): number {
  let curlyBracketsCount = 1; // 记录大括号的数量，初始为1，表示接口的起始大括号
  let index = startIndex;

  while (curlyBracketsCount > 0 && index < code.length) {
    if (code[index] === '{') {
      curlyBracketsCount++;
    } else if (code[index] === '}') {
      curlyBracketsCount--;
    }

    index++;
  }

  return curlyBracketsCount === 0 ? index : -1;
}

export function parseSourceFile(content: string) {
  // 使用正则表达式匹配导出函数的名称
  const regex = /\/\*\*\s*(.*?)\s*\*\/\s*export const (\w+)\s*=/g;
  let match;
  const interfaces: Record<string, string>[] = [];

  while ((match = regex.exec(content)) !== null) {
    /** 匹配到的注释内容 */
    const comment = match[1];
    /** 匹配到的函数名称 */
    const functionName = match[2];
    // 调用函数生成接口定义并拼接到接口字符串中
    interfaces.push({
      [`${capitalizeFirstLetter(functionName)}Request`]:
        generateRequestInterface(comment, functionName),
    });

    interfaces.push({
      [`${capitalizeFirstLetter(functionName)}Response`]:
        generateResponseInterface(comment, functionName),
    });
  }
  return interfaces;
}

/**
 * 解析已有的interface文件
 * @param content 要解析的interface文件的内容
 * @returns
 */
export function parseInterfaceFile(content: string) {
  /** 使用正则表达式匹配interface */
  const interfaceRegex =
    /\/\*\*([^}]+?)\*\/\s*export\s*interface\s*(\w+)\s*{/gs;

  const interfaces: Record<string, string>[] = [];

  let match;
  while ((match = interfaceRegex.exec(content))) {
    const comment = match[1].trim();
    const interfaceName = match[2];

    let str = `/** ${comment} */
export interface ${interfaceName} {`;

    // 寻找接口的结尾位置
    const endIndex = findInterfaceEndIndex(
      content,
      match.index + match[0].length
    );
    if (endIndex !== -1) {
      str += content.substring(match.index + match[0].length, endIndex);
    }
    interfaces.push({
      [interfaceName]: str,
    });
  }

  return interfaces;
}

export function mergeObjects(
  a: Record<string, string>,
  b: Record<string, string>
): Record<string, string> {
  const result = { ...b };

  for (const [key, value] of Object.entries(a)) {
    if (b.hasOwnProperty(key)) {
      // 如果B中有重复键，则使用B中的键值
      result[key] = b[key];
    } else {
      // 如果B中没有重复键，则使用A中的键值
      result[key] = value;
    }
  }

  return result;
}

export function mergeArrays(
  arr1: Record<string, string>[],
  arr2: Record<string, string>[]
): Record<string, string>[] {
  const result: Record<string, string>[] = [];
  const extra: Record<string, string>[] = [];
  // 复制数组A的对象到结果数组
  for (const obj of arr1) {
    result.push({ ...obj });
  }

  // 遍历数组B的对象
  for (const obj of arr2) {
    let duplicateIndex = -1;

    // 检查是否有相同的键在数组A中
    for (let i = 0; i < result.length; i++) {
      if (Object.keys(obj)[0] === Object.keys(result[i])[0]) {
        duplicateIndex = i;
        break;
      }
    }

    // 如果有重复键，则使用数组B的键值
    if (duplicateIndex !== -1) {
      result[duplicateIndex][Object.keys(obj)[0]] = Object.values(obj)[0];
    } else {
      // 否则复制数组B的对象到结果数组
      extra.push({ ...obj });
    }
  }

  return [...extra, ...result];
}

/**
 * 对象数组转为字符串
 * @param arr 对象数组
 * @returns 字符串
 */
export function objectArrayConversionToString(arr: Record<string, string>[]) {
  return arr.map((i) => Object.values(i)[0]).join('\n\n');
}
