import { isValidFile } from "./regexp";
import { getCreateIfNotFindCfg } from "./config";
import vscode from "vscode";
import {
  INVALID_TEST_FILE_MESSAGE,
  NEW_TEST_FILE_PROMPT,
  NO_FOUND_MESSAGE,
} from "./constant";
import { getBasename, getNewTestFilePath, getParentDirectory } from "./getPath";
import fs from "fs";
import { openFile } from "./jumpToFile";

export const createNewTestFile = async (
  basename: string,
  ext: string,
  parent: string,
  root: string
) => {
  if (!getCreateIfNotFindCfg()) {
    vscode.window.showInformationMessage(NO_FOUND_MESSAGE);
    return;
  }

  const filePath = getNewTestFilePath(basename, ext, parent, root);
  const realPath = await vscode.window.showInputBox({
    prompt: NEW_TEST_FILE_PROMPT,
    value: filePath,
    valueSelection: [filePath.length, filePath.length],
    validateInput(value) {
      return isValidFile(basename, value, true)
        ? null
        : INVALID_TEST_FILE_MESSAGE;
    },
  });

  if (!realPath) {
    return;
  }

  fs.mkdirSync(getParentDirectory(realPath), { recursive: true });
  fs.closeSync(fs.openSync(realPath, "w+"));
  await openFile(realPath);
};
