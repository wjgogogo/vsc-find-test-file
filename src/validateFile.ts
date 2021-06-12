import path from "path";
import { TEST_FILE_SUFFIXES, VALID_FILE_EXTENSIONS } from "./constant";

export const isValidFile = (fileName: string | undefined) => {
  if (!fileName) {
    return false;
  }

  const ext = path.extname(fileName);
  return VALID_FILE_EXTENSIONS.some((e) => e === ext);
};

export const isTestFile = (fileName: string) => {
  const name = path.basename(fileName);
  return TEST_FILE_SUFFIXES.some((suffix) => name.includes(suffix));
};
