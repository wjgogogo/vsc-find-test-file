import { isValidFile } from "./regexp";
import { getCreateIfNotFindCfg } from "./config";
import vscode, { QuickPickItem } from "vscode";
import {
  DISABLE_CREATE_TEST_FILE_WARNING_MESSAGE,
  INVALID_TEST_FILE_WARNING_MESSAGE,
  NEW_TEST_FILE_PICK_LABEL,
  NEW_TEST_FILE_PROMPT,
  NO_FOUND_WARNING_MESSAGE,
} from "./constant";
import {
  getNewTestFilePath,
  getParentDirectory,
  tryToGetTestFilePath,
} from "./getPath";
import fs from "fs";
import { openFile } from "./jumpToFile";

export interface CreateTestFileOption {
  basename: string;
  ext: string;
  parent: string;
  root: string;
}

export const createTestFile = async (
  { basename, ext, parent, root }: CreateTestFileOption,
  manualCreate: boolean = true
) => {
  if (!getCreateIfNotFindCfg()) {
    vscode.window.showInformationMessage(
      manualCreate
        ? DISABLE_CREATE_TEST_FILE_WARNING_MESSAGE
        : NO_FOUND_WARNING_MESSAGE
    );
    return;
  }

  const filePath = getNewTestFilePath(basename, ext, parent, root);

  // if test file existed, open it directly
  let existedPath = tryToGetTestFilePath(filePath, basename, ext);
  if (existedPath) {
    return await openFile(existedPath);
  }

  const userInputPath = await vscode.window.showInputBox({
    prompt: NEW_TEST_FILE_PROMPT,
    value: filePath,
    valueSelection: [filePath.length, filePath.length],
    validateInput(value) {
      return isValidFile(basename, ext, value, true)
        ? null
        : INVALID_TEST_FILE_WARNING_MESSAGE;
    },
  });

  if (!userInputPath) {
    return;
  }
  existedPath = tryToGetTestFilePath(userInputPath, basename, ext);
  if (existedPath) {
    await openFile(existedPath);
  } else {
    fs.mkdirSync(getParentDirectory(userInputPath), { recursive: true });
    fs.closeSync(fs.openSync(userInputPath, "w+"));
    await openFile(userInputPath);
  }
};

export const getCreatePickItems = () => {
  const pickItems: QuickPickItem[] = [];
  if (!getCreateIfNotFindCfg()) {
    return pickItems;
  }
  pickItems.push({
    label: `$(file-add) ${NEW_TEST_FILE_PICK_LABEL}`,
    alwaysShow: true,
  });
  return pickItems;
};
