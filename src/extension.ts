import { jumpToPossibleFiles } from './jumpToFile';
import {
  getAllPossibleSourceFilePaths,
  getAllPossibleTestFilePaths,
  getCurrentProjectPath,
} from "./getPath";
import { INVALID_FILE_ERROR_MESSAGE } from "./constant";
import vscode from "vscode";
import { createValidFileReg } from './regexp';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("find-test-file.jumpToTest", () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }

      const activeFilePath = activeEditor.document.fileName;
      
      const result=createValidFileReg().exec(activeFilePath);
      
      if (!result) {
        vscode.window.showErrorMessage(INVALID_FILE_ERROR_MESSAGE);
        return;
      }

      const workspaceFilePath = vscode.workspace.getWorkspaceFolder(
        activeEditor.document.uri
      )!.uri.fsPath;

      const root = getCurrentProjectPath(activeFilePath, workspaceFilePath);

      const [,basename,testSuffix]=result;
      
      const relativeFiles = testSuffix
      ? getAllPossibleSourceFilePaths(root,basename)
        : getAllPossibleTestFilePaths(root,basename);
        
      jumpToPossibleFiles(activeFilePath,relativeFiles);
        
    })
  );
}

export function deactivate() {}
