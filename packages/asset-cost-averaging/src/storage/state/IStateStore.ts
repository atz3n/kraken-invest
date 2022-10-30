export type State = {
    id?: string;
    pair: string;
    counter: number;
    volume: number;
    schedule: string;
}


export interface IStateStore {
    upsert(state: State): Promise<void>;
    get(): Promise<State | undefined>;
    delete(): Promise<void>
}