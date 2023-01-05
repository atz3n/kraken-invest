import { model, Schema } from "mongoose";
import { AMongoDBStore } from "../AMongoDBStore";
import { IStateStore, State } from "./IStateStore";


export class StateStoreMongoDB extends AMongoDBStore implements IStateStore {
    public static readonly ID = "currentState";


    constructor(options: { mongoUrl: string }) {
        super({
            model: model("State", new Schema<State>({
                id: { type: String, required: true },
                cumVolumes: [[{
                    symbol: { type: String, required: true },
                    volume: { type: Number, required: true }
                }]],
                counter: { type: Number, required: true }
            })),
            url: options.mongoUrl
        });
    }


    public async upsert(state: State): Promise<void> {
        state.id = StateStoreMongoDB.ID;
        await this._upsert({ id: state.id }, state);
    }


    public async get(): Promise<State> {
        return (await this._find<State>({}))[0];
    }


    public async delete(): Promise<void> {
        await this._delete({ id: StateStoreMongoDB.ID });
    }
}