import { getTestSuffixCfg } from "./config";
import { VALID_FILE_EXTENSION_REG, FILE_BASENAME_REG } from "./constant";
import RandExp from "randexp";

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


export const generateValidTestSuffix = () => {
  const suffix = getTestSuffixCfg();
  return RandExp.randexp(suffix);
};