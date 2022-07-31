import { model, Schema } from "mongoose";
import { AMongoDBStore } from "../AMongoDBStore";
import { IStateStore, State } from "./IStateStore";


export class StateStoreMongoDB extends AMongoDBStore implements IStateStore {
    constructor(options: { mongoUrl: string }) {
        super({
            model: model("State", new Schema<State>({
                isActive: { type: Boolean, required: true },
                pair: { type: String, required: true },
                schedule: { type: String, required: true },
                volume: { type: Number, required: true }
            })),
            url: options.mongoUrl
        });
    }


    public async upsert(state: State): Promise<void> {
        await super.upsert({ pair: state.pair }, state);
    }


    public async get(): Promise<State | undefined> {
        return (await this.find<State>({}))[0];
    }
}