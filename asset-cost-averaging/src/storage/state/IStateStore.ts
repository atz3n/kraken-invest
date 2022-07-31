export type State = {
    pair: string;
    isActive: boolean;
    volume: number;
    schedule: string;
}


export interface IStateStore {
    upsert(state: State): Promise<void>;
    get(): Promise<State | undefined>;
}