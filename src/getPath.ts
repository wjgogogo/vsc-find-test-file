import { getValidFileReg } from "./regexp";
import path from "path";
import fs from "fs";
import { PKG_FILE_NAME } from "./constant";
import { getExcludeFolderCfg } from "./config";

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

export const getBaseName = () => {};

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
    getExcludeFolderCfg().includes(path.basename(rootDir))
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
    const result = getValidFileReg().exec(filePath)!;
    return result && targetBasename === result[1] && result[2] === undefined;
  };

  return getAllFilePaths(rootDir, matchFn);
};

export const getAllPossibleTestFilePaths = (
  rootDir: string,
  targetBasename: string
) => {
  const matchFn = (filePath: string) => {
    const result = getValidFileReg().exec(filePath)!;
    return result && targetBasename === result[1] && result[2] !== undefined;
  };

  return getAllFilePaths(rootDir, matchFn);
};
