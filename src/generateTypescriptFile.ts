import * as fs from 'fs';

import {
  getInterfaceFilePath,
  mergeArrays,
  objectArrayConversionToString,
  parseInterfaceFile,
  parseSourceFile,
  readFileContent,
} from './utils';

/**
 * 生成TypeScript文件
 * @param sourceFilePath ts文件的路径
 * @param force 是否合并已有文件
 */
export function generateTypescriptFile(
  sourceFilePath: string,
  force: boolean = false
): void {
  /** 接口文件路径 */
  const interfaceFilePath = getInterfaceFilePath(sourceFilePath);

  if (!force && fs.existsSync(interfaceFilePath)) {
    // 非合并模式
    throw new Error('文件已存在，无法写入');
  }

  /** 源文件内容 */
  const content = readFileContent(sourceFilePath);

  /** 源文件解析后的interface数组 */
  const interfaces = parseSourceFile(content);

  /** 接口文件解析后的interface数组 */
  let existingInterfaces: Record<string, string>[] = [];

  if (force && fs.existsSync(interfaceFilePath)) {
    const interfaceFileContent = readFileContent(interfaceFilePath);
    existingInterfaces = parseInterfaceFile(interfaceFileContent);
  }

  const interfacesString = objectArrayConversionToString(
    mergeArrays(interfaces, existingInterfaces)
  );

  fs.writeFileSync(interfaceFilePath, interfacesString, 'utf-8');
}
