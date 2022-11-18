import { IStateStore } from "../../../storage/state/IStateStore";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    stateStore: IStateStore;
    maxCycles: number;
}


export class CycleCheckerService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const state = await this.options.stateStore.get();

        if (state.counter >= this.options.maxCycles) {
            params.schedule.stop();
        }
    }
}