import { AInMemoryStore } from "../AInMemoryStore";
import { IStateStore, State } from "./IStateStore";


export class StateStoreInMemory extends AInMemoryStore implements IStateStore {
    public store: State[] = [];


    public async upsert(state: State): Promise<void> {
        super.upsert(state, "pair");
    }


    public async get(): Promise<State | undefined> {
        return this.store[0];
    }
}