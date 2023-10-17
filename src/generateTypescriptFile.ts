import * as fs from 'fs';
import * as path from 'path';

import {
  capitalizeFirstLetter,
  generateRequestInterface,
  generateResponseInterface,
  mergeObjects,
  parseInterface,
  readFileContent,
} from './utils';

/**
 * 生成TypeScript文件
 * @param file JavaScript文件的路径
 * @param isOverWrite 是否覆盖原有文件
 */
function generateTypescriptFile(
  sourceFilePath: string,
  force: boolean = false
): void {
  const content = readFileContent(sourceFilePath);

  // 使用正则表达式匹配导出函数的名称
  const regex = /\/\*\*\s*(.*?)\s*\*\/\s*export const (\w+)\s*=/g;
  let match;
  const interfaces: { [key: string]: string } = {};

  while ((match = regex.exec(content)) !== null) {
    /** 匹配到的注释内容 */
    const comment = match[1];
    /** 匹配到的函数名称 */
    const functionName = match[2];
    // 调用函数生成接口定义并拼接到接口字符串中
    interfaces[`${capitalizeFirstLetter(functionName)}Request`] =
      generateRequestInterface(comment, functionName);
    interfaces[`${capitalizeFirstLetter(functionName)}Response`] =
      generateResponseInterface(comment, functionName);
  }

  const outputFileName = `${path.parse(sourceFilePath).name}.type.ts`;
  // 定义TypeScript文件的输出路径
  const outputFile = path.join(sourceFilePath, '..', outputFileName);

  if (fs.existsSync(outputFile) && !force) {
    throw new Error('文件已存在，无法写入');
  }

  // 检查是否存在需要合并的接口文件
  const interfaceFile = `${path.parse(sourceFilePath).name}.type.ts`;
  const interfaceFilePath = path.join(
    path.dirname(sourceFilePath),
    interfaceFile
  );
  let parsedInterfaces: { [key: string]: string } | undefined = undefined;
  if (fs.existsSync(interfaceFilePath)) {
    const existingInterfaces = readFileContent(interfaceFilePath);
    parsedInterfaces = parseInterface(existingInterfaces);
    console.log(
      '🌊 ~ file: generateTypescriptFile.ts:58 ~ interfaces:',
      interfaces
    );

    console.log(
      '🌊 ~ file: generateTypescriptFile.ts:48 ~ existingInterfaces:',
      parsedInterfaces
    );
  }

  // 将接口对象转换为字符串
  const interfacesString = Object.values(
    parsedInterfaces ? mergeObjects(interfaces, parsedInterfaces) : interfaces
  ).join('\n\n');
  console.log("🌊 ~ file: generateTypescriptFile.ts:74 ~ interfacesString:", interfacesString)

  fs.writeFileSync(outputFile, interfacesString, 'utf-8');
}

/**
 * 根据路径文件的函数, 生成接口文件
 */
export function build(filePath: string, force: boolean = false): void {
  // 获取命令行参数并生成TypeScript文件
  generateTypescriptFile(filePath, force);
}

/**
 * TODO
 * 先读取xxx.type.ts文件
 * 如果有内容, 先把内容拿出来
 *
 * 1. 生成文件
 * 2. 对比新生成的内容和已有文件的内容
 * 3. 如果已有文件内容中含有与
 */
