import { createTestFile } from "./createTestFile";
import { jumpToPossibleFiles } from "./jumpToFile";
import {
  getAllPossibleFilePaths,
  getBasename,
  getCurrentProjectPath,
  getParentDirectory,
} from "./getPath";
import {
  INVALID_FILE_WARNING_MESSAGE,
  NEW_TEST_FILE_WARNING_MESSAGE,
} from "./constant";
import vscode from "vscode";
import { createValidFileReg } from "./regexp";

function doPrepare() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return;
  }

  const activeFilePath = activeEditor.document.fileName;

  const result = createValidFileReg().exec(getBasename(activeFilePath));

  if (!result) {
    vscode.window.showWarningMessage(INVALID_FILE_WARNING_MESSAGE);
    return;
  }

  const workspaceFilePath = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  )!.uri.fsPath;

  const root = getCurrentProjectPath(activeFilePath, workspaceFilePath);

  const [, basename, suffix] = result;
  const ext = result[result.length - 1];
  const searchTestFile = suffix === undefined;
  return {
    root,
    activeFilePath,
    basename,
    suffix,
    ext,
    searchTestFile,
  };
}

export function activate(context: vscode.ExtensionContext) {
  // register jumpToTest command
  const jumpToTestCommand = vscode.commands.registerCommand(
    "find-test-file.jumpToTest",
    () => {
      const result = doPrepare();
      if (!result) {
        return;
      }
      const { root, activeFilePath, basename, ext, searchTestFile } = result;
      const relativeFiles = getAllPossibleFilePaths(
        basename,
        ext,
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
        createTestFile(createTestFileOption, false);
      } else if (relativeFiles.length > 0) {
        jumpToPossibleFiles(
          activeFilePath,
          relativeFiles,
          searchTestFile,
          createTestFileOption
        );
      }
    }
  );
  // register createTestFile command
  const createTestFileCommand = vscode.commands.registerCommand(
    "find-test-file.createTestFile",
    () => {
      const result = doPrepare();
      if (!result) {
        return;
      }

      const { root, activeFilePath, basename, ext, searchTestFile } = result;

      if (!searchTestFile) {
        vscode.window.showWarningMessage(NEW_TEST_FILE_WARNING_MESSAGE);
        return;
      }

      const createTestFileOption = {
        basename,
        ext,
        parent: getParentDirectory(activeFilePath),
        root,
      };
      createTestFile(createTestFileOption);
    }
  );
  context.subscriptions.push(jumpToTestCommand, createTestFileCommand);
}

export function deactivate() {}
