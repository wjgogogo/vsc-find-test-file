import fs from "fs";
import vscode, { QuickPickItem, SnippetString } from "vscode";
import { getCreateIfNotFindCfg, getInsertSnippetCfg } from "./config";
import {
  DISABLE_CREATE_TEST_FILE_WARNING_MESSAGE,
  INVALID_TEST_FILE_WARNING_MESSAGE,
  NEW_TEST_FILE_PICK_LABEL,
  NEW_TEST_FILE_PROMPT,
  NO_FOUND_WARNING_MESSAGE,
} from "./constant";
import {
  existedTestFile,
  getNewTestFilePath,
  getParentDirectory,
} from "./getPath";
import { openFile } from "./jumpToFile";
import { isValidFile } from "./regexp";

export interface CreateTestFileOption {
  basename: string;
  ext: string;
  parent: string;
  root: string;
}

export const tryCreateTestFile = async (
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
  if (existedTestFile(filePath)) {
    return await openFile(filePath);
  }

  const userInputPath = await openCreateTextFileInputBox(
    filePath,
    basename,
    ext
  );
  if (!userInputPath) {
    return;
  }

  existedTestFile(userInputPath)
    ? await openFile(userInputPath)
    : await createTestFile(userInputPath, basename);
};

const openCreateTextFileInputBox = async (
  filePath: string,
  basename: string,
  ext: string
) => {
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

  return userInputPath;
};

const createTestFile = async (inputPath: string, basename: string) => {
  fs.mkdirSync(getParentDirectory(inputPath), { recursive: true });
  fs.closeSync(fs.openSync(inputPath, "w+"));
  const editor = await openFile(inputPath);

  if (getInsertSnippetCfg()) {
    const snippet = [
      `describe('\${1:${basename} test}', () => {`,
      "\ttest('${2:should}', \t() => {",
      "\t\t${3}",
      "\t});",
      "});",
    ].join("\n");
    await editor.insertSnippet(new SnippetString(snippet));
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
