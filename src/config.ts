import vscode from "vscode";

interface Config {
  testMatch: string;
  excludeFolder: string[];
}

export const getTestMatchCfg = () => {
  const config = vscode.workspace.getConfiguration("findTestFile");

  const testMatch = config.get<Config["testMatch"]>("testMatch")!;
  const defaultCfg =
    config.inspect<Config["testMatch"]>("testMatch")!.defaultValue;

  const normalized = testMatch.trim();
  return normalized.length === 0 ? defaultCfg : normalized;
};

export const getExcludeFolderCfg = () => {
  const config = vscode.workspace.getConfiguration("findTestFile");
  const excludeFolder = config.get<Config["excludeFolder"]>("excludeFolder")!;
  const defaultCfg =
    config.inspect<Config["excludeFolder"]>("excludeFolder")!.defaultValue;

  const normalized = excludeFolder
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  return normalized.length === 0 ? defaultCfg : normalized;
};
