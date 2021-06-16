import {
  createTestFile,
  CreateTestFileOption,
  getCreatePickItems,
} from "./createTestFile";
import vscode, { QuickPickItem } from "vscode";
import path from "path";
import similarity from "string-similarity";
import { SIMILARITY_TOLERANCE } from "./constant";

export const openFile = async (filePath: string) => {
  const document = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(document);
};

export const jumpToPossibleFiles = async (
  current: string,
  relativeFiles: string[],
  isJumpToTestFile: boolean,
  createTestFileOption: CreateTestFileOption
) => {
  const matches = similarity.findBestMatch(current, relativeFiles);

  const bestRating = matches.bestMatch.rating;
  const possibleMatches = matches.ratings
    .sort((a, b) => b.rating - a.rating)
    .filter((r) => bestRating - r.rating <= SIMILARITY_TOLERANCE)
    .map((r) => r.target);

  if (possibleMatches.length === 1) {
    await openFile(possibleMatches[0]);
  } else {
    let pickItems = possibleMatches.map(
      (i, idx) =>
        ({
          picked: idx === 0, // select best match by default
          label: path.basename(i),
          description: i,
        } as QuickPickItem)
    );

    if (isJumpToTestFile) {
      pickItems = pickItems.concat(getCreatePickItems());
    }
    const select = await vscode.window.showQuickPick(pickItems);

    if (!select) {
      return;
    }
    if (select.description) {
      await openFile(select.description!);
    } else if (isJumpToTestFile) {
      await createTestFile(createTestFileOption);
    }
  }
};
