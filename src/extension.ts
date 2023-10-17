import * as vscode from 'vscode';
import { build } from './generateTypescriptFile';

function gen(sourceFilePath: string, force: boolean = false) {
  try {
    build(sourceFilePath, force);
    vscode.window.showInformationMessage('生成文件成功！');
  } catch (error: any) {
    vscode.window.showErrorMessage('生成文件失败：' + error.message);
  }
}

// 当您的扩展被激活时，将调用此方法
// 您的扩展在第一次执行命令时激活
export function activate(context: vscode.ExtensionContext) {
  // 使用控制台输出诊断信息（console.log）和错误（console.error）
  // 这行代码只会在激活您的扩展时执行一次

  const genInterfaceCommand = vscode.commands.registerCommand(
    'gen-interface.genInterface',
    (uri: vscode.Uri) => {
      // uri会给出命令执行时选择的路径
      // 如果右键点击文件夹，这里就是文件夹的路径

      const sourceFilePath = uri.fsPath;
      gen(sourceFilePath);
    }
  );

  const genInterfaceForceCommand = vscode.commands.registerCommand(
    'gen-interface.genInterfaceForce',
    (uri: vscode.Uri) => {
      const sourceFilePath = uri.fsPath;
      gen(sourceFilePath, true);
    }
  );

  // 注册到监听队列中
  context.subscriptions.push(genInterfaceCommand, genInterfaceForceCommand);
}

// 在您的扩展停用时将调用此方法
export function deactivate() {}
