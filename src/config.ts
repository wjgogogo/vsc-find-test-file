import vscode from "vscode";

interface Config {
  testSuffix: string;
  excludeFolder: string[];
  preferStructureMode: "separate" | "unite";
  preferTestDirectory: string;
}

const getCfgByKey = <T extends keyof Config>(key: T) => {
  const config = vscode.workspace.getConfiguration("findTestFile");

  const testSuffix = config.get<Config[T]>(key)!;
  const defaultCfg = config.inspect<Config[T]>(key)!.defaultValue!;
  return [testSuffix, defaultCfg];
};

export const getTestSuffixCfg = () => {
  const [testMatch, defaultCfg] = getCfgByKey("testSuffix");

  const normalized = testMatch.trim();
  return normalized.length === 0 ? defaultCfg : normalized;
};

export const getExcludeFolderCfg = () => {
  const [excludeFolder, defaultCfg] = getCfgByKey("excludeFolder");

  const normalized = excludeFolder
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  return normalized.length === 0 ? defaultCfg : normalized;
};

export const getPreferStructureModeCfg = () => {
  const [mode] = getCfgByKey("preferStructureMode");
  return mode;
};

export const getPreferTestDirectoryCfg = () => {
  const [directory, defaultCfg] = getCfgByKey("preferTestDirectory");

  const normalized = directory.trim();
  return normalized.length === 0 ? defaultCfg : normalized;
};


