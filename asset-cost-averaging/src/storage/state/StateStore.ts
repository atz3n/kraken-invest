import { IStateStore } from "./IStateStore";


export class StateStore {
    private static store: IStateStore;


    public static init(store: IStateStore): void {
        this.store = store;
    }


    public static get(): IStateStore {
        if (!this.store) {
            throw new Error("State store not initialized! Call init function first");
        }
        return this.store;
    }
}