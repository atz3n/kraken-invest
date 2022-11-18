export type State = {
    id?: string;
    trades: {
        pair: string;
        volume: number;
    }[];
    counter: number;
    schedule: string;
}


export interface IStateStore {
    upsert(state: State): Promise<void>;
    get(): Promise<State>;
    delete(): Promise<void>
}