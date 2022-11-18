import { CumVolume } from "../../types";


export type State = {
    id?: string;
    cumVolumes: CumVolume[];
    counter: number;
    schedule: string;
}


export interface IStateStore {
    upsert(state: State): Promise<void>;
    get(): Promise<State>;
    delete(): Promise<void>
}