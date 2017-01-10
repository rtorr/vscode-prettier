'use strict';

import * as vscode from 'vscode';
import * as prettier from 'prettier';

function checkEditorLanguage(document) {
    return document.languageId !== 'javascript' && document.languageId !== 'javascriptreact';
}

function startBuildOnSaveWatcher(subscriptions: vscode.Disposable[]) {
    vscode.workspace.onDidSaveTextDocument(document => {
        let options = {};
        if (vscode.workspace.getConfiguration('prettier').get('prettier')) {
            options = vscode.workspace.getConfiguration('prettier').get('options');
        }
        let ignoreNextSave = new WeakSet<vscode.TextDocument>();
        let textEditor = vscode.window.activeTextEditor;
        let text = document.getText();
        if (checkEditorLanguage(document) || ignoreNextSave.has(document)) {
            return;
        }
        try {
            var transformed = prettier.format(text, options);
        } catch (e) {
            vscode.window.showInformationMessage('Error transforming using prettier');
            transformed = text;
        }
        textEditor.edit(editBuilder => {
            var a = new vscode.Position(0, 0);
            var aa = new vscode.Position(document.lineCount, 0);
            var b = new vscode.Range(a, aa);
            ignoreNextSave.add(document);
            editBuilder.replace(b, transformed);
            return document.save();
        });
        ignoreNextSave.delete(document);
    });
}

export function activate(context: vscode.ExtensionContext) {
    if (vscode.workspace.getConfiguration('prettier').get('updateOnSave') === false) {
        return;
    }
    startBuildOnSaveWatcher(context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {
}