
export interface IDisposable {
    dispose(): void;
}

class UseDisposedObjectError extends Error {
    constructor() {
        super('The object has already been disposed.');
    }
}

export class DisposableStore implements IDisposable {
    _disposed = false;
    private readonly _store = new Set<IDisposable>();

    add<T extends IDisposable>(item: T): T {
        if (this._disposed) {
            throw new UseDisposedObjectError();
        }
        this._store.add(item);
        return item;
    }

    clear(): void {
        this._store.forEach(item => item.dispose());
        this._store.clear();
    }

    dispose(): void {
        this.clear();
        this._disposed = true;
    }
}

export abstract class Disposable {
    private readonly _store = new DisposableStore();

    protected _register<T extends IDisposable>(disposable: T): T {
        return this._store.add(disposable);
    }

    dispose(): void {
        this._store.dispose();
    }
}
