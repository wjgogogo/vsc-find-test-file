import RandExp from "randexp";
import { getTestSuffixCfg } from "./config";
import { FILE_BASENAME_REG, VALID_FILE_EXTENSION_REG } from "./constant";
import { getBasename } from "./getPath";

let reg: RegExp;

export const createValidFileReg = () => {
  const suffix = getTestSuffixCfg();
  reg = new RegExp(
    `${FILE_BASENAME_REG}(${suffix})?${VALID_FILE_EXTENSION_REG}`
  );
  return reg;
};

export const getValidFileReg = () => {
  return reg ? reg : createValidFileReg();
};

export const isValidFile = (
  targetBasename: string,
  ext: string,
  filePath: string,
  isTestFile: boolean = false
) => {
  const result = getValidFileReg().exec(getBasename(filePath))!;
  return (
    result &&
    targetBasename === result[1] &&
    ext === result[result.length - 1] &&
    (isTestFile ? result[2] !== undefined : result[2] === undefined)
  );
};

export const generateValidTestSuffix = () => {
  const suffix = getTestSuffixCfg();
  return RandExp.randexp(suffix);
};
