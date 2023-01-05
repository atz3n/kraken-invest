import { IScheduler } from "../../src/schedule/IScheduler";
import { Task } from "../../src/schedule/taskFactory";


export interface Options {
    startCb?: () => void;
    stopCb?: () => void;
    getTaskCb?: () => Task;
}

export class SchedulerMock implements IScheduler {
    constructor(readonly options: Options) {}


    public start(): void {
        if (this.options.startCb) {
            this.options.startCb();
        }
    }


    public stop(): void {
        if (this.options.stopCb) {
            this.options.stopCb();
        }
    }


    public getTask(): Task {
        if (this.options.getTaskCb) {
            return this.options.getTaskCb();
        }
        return {
            cronSchedule: "dummy",
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            start: async () => {}
        };
    }
}