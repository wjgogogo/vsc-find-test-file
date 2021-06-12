import { INVALID_FILE_ERROR_MESSAGE } from "./constant";
import vscode from "vscode";
import { isTestFile, isValidFile } from "./validateFile";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("find-test-file.jumpToTest", () => {
      const activeFile = vscode.window.activeTextEditor?.document.fileName;

      if (!isValidFile(activeFile)) {
        vscode.window.showErrorMessage(INVALID_FILE_ERROR_MESSAGE);
        return;
      }
      if    (isTestFile(activeFile!))    {
        console.log("find is test file", activeFile);
      }
    })
  );
}

export function deactivate() {}
