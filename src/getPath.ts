import { generateValidTestSuffix, isValidFile } from "./regexp";
import path from "path";
import fs from "fs";
import { PKG_FILE_NAME, SOURCE_FOLDER } from "./constant";
import { getCreateTestFilePreferCfg, getExcludeFolderCfg } from "./config";

export const getCurrentProjectPath = (
  filePath: string,
  workspacePath: string
) => {
  let current = path.dirname(filePath);

  if (current === workspacePath) {
    return workspacePath;
  }

  do {
    const pkgPath = path.join(current, PKG_FILE_NAME);
    if (fs.existsSync(pkgPath)) {
      return current;
    }
    current = path.dirname(current);
  } while (current !== workspacePath);
  return workspacePath;
};

export const getAllPossibleFilePaths = (
  targetBasename: string,
  ext: string,
  rootDir: string,
  searchTestFile: boolean = false
) => {
  const files: string[] = [];

  if (!fs.existsSync(rootDir)) {
    return files;
  }

  if (fs.statSync(rootDir).isFile()) {
    if (isValidFile(targetBasename, ext, rootDir, searchTestFile)) {
      files.push(rootDir);
    }
    return files;
  }

  if (
    fs.statSync(rootDir).isDirectory() &&
    getExcludeFolderCfg().includes(getBasename(rootDir))
  ) {
    return files;
  }

  fs.readdirSync(rootDir).forEach((name) => {
    files.push(
      ...getAllPossibleFilePaths(
        targetBasename,
        ext,
        path.join(rootDir, name),
        searchTestFile
      )
    );
  });
  return files;
};

export const getBasename = (filePath: string) => {
  return path.basename(filePath);
};

export const getParentDirectory = (filePath: string) => {
  return path.dirname(filePath);
};

export const getNewTestFilePath = (
  basename: string,
  ext: string,
  parent: string,
  root: string
) => {
  const { preferStructureMode, preferTestDirectory } =
    getCreateTestFilePreferCfg();
  const testFileName = `${basename}${generateValidTestSuffix()}${ext}`;
  let directory;
  if (preferStructureMode === "separate") {
    const newRoot = path.join(root, preferTestDirectory.separate);
    let relative = parent.slice(root.length);
    if (relative.startsWith(`/${SOURCE_FOLDER}`)) {
      relative = relative.slice(`/${SOURCE_FOLDER}`.length);
    }
    directory = relative.length === 0 ? newRoot : path.join(newRoot, relative);
  } else {
    directory = path.join(parent, preferTestDirectory.unite);
  }

  return path.join(directory, testFileName);
};

export const tryToGetTestFilePath = (
  filePath: string,
  basename: string,
  ext: string
) => {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const parent = getParentDirectory(filePath);
  const fileName = fs
    .readdirSync(parent)
    .find(
      (name) =>
        fs.statSync(path.join(parent, name)).isFile() &&
        isValidFile(basename, ext, name, true)
    );
  return fileName && path.join(parent, fileName);
};
