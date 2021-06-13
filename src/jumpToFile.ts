import vscode from "vscode";
import path from "path";
import similarity from "string-similarity";
import { SIMILARITY_TOLERANCE } from "./constant";

const openFile = async (filePath: string) => {
  const document = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(document);
};

export const jumpToPossibleFiles = async (
  current: string,
  relativeFiles: string[]
) => {
  const matches = similarity.findBestMatch(current, relativeFiles);
  const bestRating = matches.bestMatch.rating;
  const possibleMatches = matches.ratings
    .sort((a, b) => b.rating - a.rating)
    .filter((r) => bestRating - r.rating <= SIMILARITY_TOLERANCE)
    .map((r) => r.target);

  if (possibleMatches.length === 0) {
    return;
  } else if (possibleMatches.length === 1) {
    await openFile(possibleMatches[0]);
  } else {
    const select = await vscode.window.showQuickPick(
      possibleMatches.map((i) => ({
        label: path.basename(i),
        description: i,
      }))
    );
    if (select) {
      await openFile(select.description);
    }
  }
};
