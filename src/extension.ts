import * as vscode from 'vscode';
import { globalState } from './base/state';
import { NPMRCTreeView } from './npmrc/npmrcTree';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(globalState.use(context.globalState));
    context.subscriptions.push(new NPMRCTreeView());
}
