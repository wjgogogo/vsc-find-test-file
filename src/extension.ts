import { createTestFile } from "./createTestFile";
import { jumpToPossibleFiles } from "./jumpToFile";
import {
  getAllPossibleFilePaths,
  getBasename,
  getCurrentProjectPath,
  getParentDirectory,
} from "./getPath";
import { INVALID_FILE_MESSAGE } from "./constant";
import vscode from "vscode";
import { createValidFileReg } from "./regexp";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("find-test-file.jumpToTest", () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return;
      }

      const activeFilePath = activeEditor.document.fileName;

      const result = createValidFileReg().exec(getBasename(activeFilePath));

      if (!result) {
        vscode.window.showWarningMessage(INVALID_FILE_MESSAGE);
        return;
      }

      const workspaceFilePath = vscode.workspace.getWorkspaceFolder(
        activeEditor.document.uri
      )!.uri.fsPath;

      const root = getCurrentProjectPath(activeFilePath, workspaceFilePath);

      const [, basename, suffix] = result;
      const ext = result[result.length - 1];
      const searchTestFile = suffix === undefined;

      const relativeFiles = getAllPossibleFilePaths(
        basename,
        root,
        searchTestFile
      );
      const createTestFileOption = {
        basename,
        ext,
        parent: getParentDirectory(activeFilePath),
        root,
      };

      if (relativeFiles.length === 0 && searchTestFile) {
        createTestFile(createTestFileOption);
      } else if (relativeFiles.length > 0) {
        jumpToPossibleFiles(
          activeFilePath,
          relativeFiles,
          searchTestFile,
          createTestFileOption
        );
      }
    })
  );
}

export function deactivate() {}
