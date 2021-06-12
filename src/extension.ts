import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "find-test-file" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "find-test-file.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from find-test-file!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
