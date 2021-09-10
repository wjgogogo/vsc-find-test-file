import vscode from "vscode";
import {
  INVALID_FILE_WARNING_MESSAGE,
  NEW_TEST_FILE_WARNING_MESSAGE,
} from "./constant";
import { tryCreateTestFile } from "./createTestFile";
import {
  getAllPossibleFilePaths,
  getBasename,
  getParentDirectory,
  getRootPath,
} from "./getPath";
import { jumpToPossibleFile } from "./jumpToFile";
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

  const workspacePath = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  )!.uri.fsPath;

  const root = getRootPath(activeFilePath, workspacePath);

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
      const possibleFiles = getAllPossibleFilePaths(
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

      if (possibleFiles.length === 0 && searchTestFile) {
        tryCreateTestFile(createTestFileOption, false);
      } else if (possibleFiles.length > 0) {
        jumpToPossibleFile(
          activeFilePath,
          possibleFiles,
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
      tryCreateTestFile(createTestFileOption);
    }
  );
  context.subscriptions.push(jumpToTestCommand, createTestFileCommand);
}

export function deactivate() {}
