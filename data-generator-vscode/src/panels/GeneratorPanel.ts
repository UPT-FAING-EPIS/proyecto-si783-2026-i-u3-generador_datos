import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConnectorFactory } from '../core/connectors/ConnectorFactory';
import { DataGenerator } from '../core/generators/dataGenerator';

export class GeneratorPanel {
  public static currentPanel: GeneratorPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent();
    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: vscode.Uri) {
    if (GeneratorPanel.currentPanel) {
      GeneratorPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'dataGenerator',
        'Data Generator',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist', 'webview', 'assets')]
        }
      );

      GeneratorPanel.currentPanel = new GeneratorPanel(panel, extensionUri);
    }
  }

  public dispose() {
    GeneratorPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent() {
    const webview = this._panel.webview;
    const manifestPath = path.join(this._extensionUri.fsPath, 'dist', 'webview', 'assets');
    
    // In Vite build, the output is in assets/main-xyz.js and assets/main-xyz.css
    // We need to dynamically read the folder to get the exact filenames.
    let scriptUri = '';
    let styleUri = '';
    
    if (fs.existsSync(manifestPath)) {
      const files = fs.readdirSync(manifestPath);
      const jsFile = files.find(f => f.endsWith('.js'));
      const cssFile = files.find(f => f.endsWith('.css'));
      
      if (jsFile) {
        scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', jsFile)).toString();
      }
      if (cssFile) {
        styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', cssFile)).toString();
      }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${styleUri ? `<link rel="stylesheet" href="${styleUri}">` : ''}
  <title>Data Generator</title>
</head>
<body>
  <div id="root"></div>
  ${scriptUri ? `<script type="module" src="${scriptUri}"></script>` : ''}
</body>
</html>`;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    let currentConnector: any = null;

    webview.onDidReceiveMessage(
      async (message: any) => {
        const command = message.type;

        switch (command) {
          case 'connect':
            try {
              currentConnector = ConnectorFactory.getConnector(message.uri);
              await currentConnector.connect();
              const schema = await currentConnector.getSchema();
              webview.postMessage({ type: 'schema_loaded', data: schema });
              vscode.window.showInformationMessage('Successfully connected and analyzed schema.');
            } catch (error: any) {
              vscode.window.showErrorMessage('Failed to connect: ' + error.message);
              webview.postMessage({ type: 'error', error: error.message });
            }
            return;

          case 'generate':
            try {
              if (!currentConnector) {
                throw new Error("No database connection active.");
              }
              const { schema, configs, useAi, prompt, apiKey } = message;
              vscode.window.showInformationMessage('Starting data generation...');
              
              const generator = new DataGenerator();
              const generatedData = await generator.generate(schema, configs, useAi, prompt, apiKey);
              
              // Sort tables again for insertion
              const tableNames = configs.filter((c:any) => c.selected).map((c:any) => c.tableName);
              const sortedTables = generator['topologicalSort'](schema, tableNames);

              vscode.window.showInformationMessage('Inserting data into database...');
              await currentConnector.insertData(generatedData, sortedTables);
              
              webview.postMessage({ type: 'generation_complete' });
              vscode.window.showInformationMessage('Data generation and insertion completed successfully!');
            } catch (error: any) {
              const errMsg = error.message || "";
              if (message.useAi && (errMsg.includes("Fallo en la generación de IA") || errMsg.includes("Gemini API Key"))) {
                const choice = await vscode.window.showErrorMessage(
                  errMsg,
                  'Generar sin IA'
                );
                if (choice === 'Generar sin IA') {
                  try {
                    vscode.window.showInformationMessage('Generando datos localmente sin IA...');
                    const generator = new DataGenerator();
                    const generatedData = await generator.generate(message.schema, message.configs, false, message.prompt, "");
                    const tableNames = message.configs.filter((c:any) => c.selected).map((c:any) => c.tableName);
                    const sortedTables = generator['topologicalSort'](message.schema, tableNames);
                    await currentConnector.insertData(generatedData, sortedTables);
                    webview.postMessage({ type: 'generation_complete' });
                    vscode.window.showInformationMessage('Datos generados localmente con éxito.');
                  } catch (fallbackErr: any) {
                    vscode.window.showErrorMessage('Fallo al generar sin IA: ' + fallbackErr.message);
                    webview.postMessage({ type: 'error', error: fallbackErr.message });
                  }
                  return;
                }
              }
              vscode.window.showErrorMessage('Generation failed: ' + errMsg);
              webview.postMessage({ type: 'error', error: errMsg });
            }
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
