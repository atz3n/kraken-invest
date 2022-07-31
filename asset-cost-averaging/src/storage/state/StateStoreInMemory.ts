import { AInMemoryStore } from "../AInMemoryStore";
import { IStateStore, State } from "./IStateStore";


export class StateStoreInMemory extends AInMemoryStore implements IStateStore {
    public static readonly ID = "currentState";
    public store: State[] = [];


    public async upsert(state: State): Promise<void> {
        state.id = StateStoreInMemory.ID;
        super.upsert(state, "id");
    }


    public async get(): Promise<State | undefined> {
        return this.store[0];
    }


    public async delete(): Promise<void> {
        super.delete("id", StateStoreInMemory.ID);
    }
}