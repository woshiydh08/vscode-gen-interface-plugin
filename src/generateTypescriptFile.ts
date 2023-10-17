import * as fs from 'fs';

import * as path from 'path';
/**
 * 将字符串的首字母大写
 * @param str 输入的字符串
 * @returns 首字母大写后的字符串
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 生成接口定义
 * @param comment 注释名
 * @param functionName 函数名
 * @returns 接口定义的字符串
 */
function generateInterface(comment: string, functionName: string): string {
  /** 定义请求参数接口 */
  const requestInterface = `/** ${comment}参数 */
export interface ${capitalizeFirstLetter(functionName)}Request {

}

`;
  /** 定义响应结果接口 */
  const responseInterface = `/** ${comment}响应 */
export interface ${capitalizeFirstLetter(functionName)}Response {

}

`;

  return requestInterface + responseInterface;
}

/**
 * 解析给定的文件路径并获取文件内容
 * @param file JavaScript文件的路径
 * @returns
 */
function readFileContent(file: string): string {
  const filePath = path.resolve(file);
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 生成TypeScript文件
 * @param file JavaScript文件的路径
 * @param isOverWrite 是否覆盖原有文件
 */
function generateTypescriptFile(sourceFilePath: string, force: boolean  = false): void {
  const content = readFileContent(sourceFilePath);

  // 使用正则表达式匹配导出函数的名称
  const regex = /\/\*\*\s*(.*?)\s*\*\/\s*export const (\w+)\s*=/g;
  let match;
  let interfaces = '';

  while ((match = regex.exec(content)) !== null) {
    /** 匹配到的注释内容 */
    const comment = match[1];
    /** 匹配到的函数名称 */
    const functionName = match[2];
    // 调用函数生成接口定义并拼接到接口字符串中
    interfaces += generateInterface(comment, functionName);
  }

  const outputFileName = `${path.parse(sourceFilePath).name}.type.ts`;
  // 定义TypeScript文件的输出路径
  const outputFile = path.join(sourceFilePath, '..', outputFileName);

  if (fs.existsSync(outputFile) && !force) {
    throw new Error('文件已存在，无法写入');
  }

  fs.writeFileSync(outputFile, interfaces, 'utf-8');
}

/**
 * 根据路径文件的函数, 生成接口文件
 */
export function build(filePath: string, force: boolean  = false): void {
  // 获取命令行参数并生成TypeScript文件
  generateTypescriptFile(filePath, force);
}

/**
 * TODO
 * 先读取xxx.type.ts文件
 * 如果有内容, 先把内容拿出来
 * 
 */