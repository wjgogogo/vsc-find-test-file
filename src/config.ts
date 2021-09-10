import vscode from "vscode";

interface Config {
  basic: {
    testSuffix: string;
    excludeFolder: string[];
  };
  createIfNotFind: {
    enable: boolean;
    insertSnippet: boolean;
    preferStructureMode: "separate" | "unite";
    preferTestDirectory: {
      separate: string;
      unite: string;
    };
  };
}

const getCfgByKey = <K1 extends keyof Config, K2 extends keyof Config[K1]>(
  primary: K1,
  key: K2
) => {
  const config = vscode.workspace.getConfiguration("findTestFile");

  const cfg = config.get<Config[K1][K2]>(`${primary}.${key}`)!;
  const defaultCfg = config.inspect<Config[K1][K2]>(`${primary}.${key}`)!
    .defaultValue!;
  return [cfg, defaultCfg];
};

const normalizeStringCfg = (value: string, defaultValue: string) => {
  value = value.trim();
  return value.length > 0 ? value : defaultValue;
};

export const getTestSuffixCfg = () => {
  const [testMatch, defaultCfg] = getCfgByKey("basic", "testSuffix");
  return normalizeStringCfg(testMatch, defaultCfg);
};

export const getExcludeFolderCfg = () => {
  const [excludeFolder, defaultCfg] = getCfgByKey("basic", "excludeFolder");

  const normalized = [
    ...new Set(excludeFolder.map((c) => c.trim()).filter((c) => c.length > 0)),
  ];
  return normalized.length === 0 ? defaultCfg : normalized;
};

export const getCreateIfNotFindCfg = () => {
  const [enable] = getCfgByKey("createIfNotFind", "enable");
  return enable;
};

export const getInsertSnippetCfg = () => {
  const [insertSnippet] = getCfgByKey("createIfNotFind", "insertSnippet");
  return insertSnippet;
};

export const getCreateTestFilePreferCfg = () => {
  const [preferStructureMode] = getCfgByKey(
    "createIfNotFind",
    "preferStructureMode"
  );

  const [preferTestDirectory, defaultPreferTestDirectory] = getCfgByKey(
    "createIfNotFind",
    "preferTestDirectory"
  );

  return {
    preferStructureMode,
    preferTestDirectory: {
      separate: normalizeStringCfg(
        preferTestDirectory.separate,
        defaultPreferTestDirectory.separate
      ),
      unite: normalizeStringCfg(
        preferTestDirectory.unite,
        defaultPreferTestDirectory.unite
      ),
    },
  };
};
