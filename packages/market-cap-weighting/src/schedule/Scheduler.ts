import { schedule, ScheduledTask } from "node-cron";
import { Task } from "./taskFactory";


export interface Options {
    task: Task;
}

export class Scheduler {
    private scheduledTask?: ScheduledTask;
    private task: Task;


    constructor(private readonly options: Options) {
        this.task = this.options.task;
    }


    public start(): void {
        if (this.scheduledTask) {
            return;
        }
        this.scheduledTask = schedule(this.options.task.cronSchedule, async () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await this.task.start(this.scheduledTask!);
        });
    }


    public stop(): void {
        if (!this.scheduledTask) {
            return;
        }
        this.scheduledTask.stop();
    }


    public getTask(): Task {
        return this.options.task;
    }
}