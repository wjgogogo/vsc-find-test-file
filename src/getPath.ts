import { generateValidTestSuffix, getValidFileReg } from "./regexp";
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

const getAllFilePaths = (
  rootDir: string,
  matchFn: (filePath: string) => boolean
) => {
  const files: string[] = [];

  if (!fs.existsSync(rootDir)) {
    return files;
  }

  if (fs.statSync(rootDir).isFile()) {
    if (matchFn(rootDir)) {
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
    files.push(...getAllFilePaths(path.join(rootDir, name), matchFn));
  });
  return files;
};

export const getAllPossibleSourceFilePaths = (
  rootDir: string,
  targetBasename: string
) => {
  const matchFn = (filePath: string) => {
    const result = getValidFileReg().exec(getBasename(filePath))!;
    return result && targetBasename === result[1] && result[2] === undefined;
  };

  return getAllFilePaths(rootDir, matchFn);
};

export const getAllPossibleTestFilePaths = (
  rootDir: string,
  targetBasename: string
) => {
  const matchFn = (filePath: string) => {
    const result = getValidFileReg().exec(getBasename(filePath))!;
    return result && targetBasename === result[1] && result[2] !== undefined;
  };

  return getAllFilePaths(rootDir, matchFn);
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
    const newRoot = `${root}/${preferTestDirectory.separate}`;
    let relative = parent.slice(root.length);
    if (relative.startsWith(`/${SOURCE_FOLDER}`)) {
      relative = relative.slice(`/${SOURCE_FOLDER}`.length);
    }
    directory = relative.length === 0 ? newRoot : `${newRoot}${relative}`;
  } else {
    directory = `${parent}/${preferTestDirectory.unite}`;
  }

  return `${directory}/${testFileName}`;
};
