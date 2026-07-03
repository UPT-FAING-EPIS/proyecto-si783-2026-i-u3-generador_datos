import * as vscode from 'vscode';
import { GeneratorPanel } from './panels/GeneratorPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('Data Generator Extension is now active!');

  const openCommand = vscode.commands.registerCommand('dataGenerator.open', () => {
    GeneratorPanel.render(context.extensionUri);
  });

  context.subscriptions.push(openCommand);
}

export function deactivate() {
  // Disconnect from database if needed
}
