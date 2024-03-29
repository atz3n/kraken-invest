import { ScheduledTask } from "node-cron";
import { IScheduler } from "../../IScheduler";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    numberOfBuys: number;
    getCycleCounter: () => Promise<number> | number;
    cycleCounterCb: (cycleCount: number) => Promise<void> | void;
    withdrawalScheduler: IScheduler;
}

export class CycleCounterCheckService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        let cycleCount = await this.options.getCycleCounter();

        if (this.options.numberOfBuys > 0) {
            cycleCount++;
            await this.options.cycleCounterCb(cycleCount);

            if (cycleCount >= this.options.numberOfBuys) {
                params.schedule.stop();
                this.options.withdrawalScheduler.stop();
                this.options.withdrawalScheduler.getTask().start(<ScheduledTask> {});
            }
        }
    }
}