import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    getCycleCount: () => Promise<number> | number;
    maxCycles: number;
}

export class CycleCheckerService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const cycleCount = await this.options.getCycleCount();

        if (cycleCount >= this.options.maxCycles) {
            params.schedule.stop();
        }
    }
}