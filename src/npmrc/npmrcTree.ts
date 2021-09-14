import * as vscode from 'vscode';
import { Disposable } from '../base/lifecycle';
import { globalState } from '../base/state';

enum NPMRCTreeNodeType {
    Variable,
    Option,
}

interface IVariableNode {
    type: NPMRCTreeNodeType.Variable;
    name: string;
    value: any;
    options: IOptionNode[];
}

interface IOptionNode {
    type: NPMRCTreeNodeType.Option;
    displayName?: string;
    value: any;
}

type INPMRCTreeNode = IVariableNode | IOptionNode;

const NPMRC_TREE_DATA_STATE = 'devconfig.states.npmrc';

export class NPMRCTreeView extends Disposable {
    private readonly treeDataProvider = this._register(new NPMRCTreeDataProvider());
    private readonly treeView: vscode.TreeView<INPMRCTreeNode> = this._register(vscode.window.createTreeView('devconfig.views.npmrc', { treeDataProvider: this.treeDataProvider, showCollapseAll: true }));

    constructor() {
        super();
        this._register(vscode.commands.registerCommand('devconfig.commands.npmrc.addVariable', () => this.addVariable()));
    }

    private addVariable(): Thenable<void> {
        return vscode.window.showInputBox({
            prompt: 'Enter a npm config variable. (e.g. registry)'
        }).then((e) => {
            if (e) {
                this.treeDataProvider.addVariable(e);
            }
        });
    }
}

class NPMRCTreeDataProvider extends Disposable implements vscode.TreeDataProvider<INPMRCTreeNode> {
    private readonly _onDidChangeTreeData = this._register(new vscode.EventEmitter<void>());
    readonly onDidChangeTreeData: vscode.Event<void> = this._onDidChangeTreeData.event;

    private variableNodes: IVariableNode[];

    constructor() {
        super();
        this.variableNodes = globalState.get<IVariableNode[]>(NPMRC_TREE_DATA_STATE) ?? [];
        this._register(this.onDidChangeTreeData(() => globalState.update(NPMRC_TREE_DATA_STATE, this.variableNodes)));
    }

    getChildren(node?: INPMRCTreeNode): INPMRCTreeNode[] | undefined {
        if (!node) {
            return this.variableNodes;
        }

        if (node.type === NPMRCTreeNodeType.Variable) {
            return node.options;
        } else {
            return undefined;
        }
    }

    getTreeItem(element: INPMRCTreeNode): vscode.TreeItem {
        if (element.type === NPMRCTreeNodeType.Variable) {
            return new NPMRCVariableTreeItem(element.name);
        } else {
            return new NPMRCOptionTreeItem(element.displayName ?? element.value.toString());
        }
    }

    addVariable(name: string): void {
        this.variableNodes.push({
            type: NPMRCTreeNodeType.Variable,
            name,
            value: undefined,
            options: [],
        });
        this._onDidChangeTreeData.fire();
    }
}

class NPMRCVariableTreeItem extends vscode.TreeItem {
    iconPath = new vscode.ThemeIcon('gear');
}

class NPMRCOptionTreeItem extends vscode.TreeItem {
    iconPath = new vscode.ThemeIcon('circle-outline'); // todo: 'circle-filled' while this option is used
}
