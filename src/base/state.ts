import * as vscode from 'vscode';
import { Disposable, IDisposable } from './lifecycle';

interface IState {
    get<T>(key: string, defaultValue?: any): T | undefined;
    update(key: string, value: any): Thenable<void>;
}

interface IWatchCallBack<T> {
    (key: string, value: T | undefined): void;
}

export const globalState = new class GlobalState extends Disposable {
    private readonly _onStateDidChange = this._register(new vscode.EventEmitter<string>());
    readonly onStateDidChange: vscode.Event<string> = this._onStateDidChange.event;

    private _globalState: IState | undefined;

    private get globalState(): IState {
        if (!this._globalState) {
            throw new Error('Please `globalState.use(context.globalState);`');
        }
        return this._globalState;
    }

    use(globalState: IState): IDisposable {
        this._globalState = globalState;
        return this;
    }

    get<T>(key: string, defaultValue?: any): T | undefined {
        return this.globalState.get<T>(key, defaultValue);
    }

    update(key: string, value: any): Thenable<void> {
        return this.globalState.update(key, value).then(() => this._onStateDidChange.fire(key));
    }

    watch<T = any>(key: string, callback: IWatchCallBack<T>): IDisposable {
        return this._register(this.onStateDidChange(e => {
            if (e === key) {
                callback(key, this.get<T>(key));
            }
        }));
    }
}();
