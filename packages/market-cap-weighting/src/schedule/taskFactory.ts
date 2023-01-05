import { logger } from "@atz3n/kraken-invest-common";
import { ScheduledTask } from "node-cron";


export interface TaskService {
    run(params: TaskServiceParams): Promise<void | TaskServiceCode> | void | TaskServiceCode;
}

export interface TaskServiceParams {
    schedule: ScheduledTask;
    sharedObject: Record<string, unknown>;
}

export enum TaskServiceCode {
    CONTINUE,
    STOP
}


export interface TaskFactoryParams {
    cronSchedule: string;
    services: TaskService[];
}


export interface Task {
    cronSchedule: string;
    start(schedule: ScheduledTask): Promise<void>;
}

export function createTask(params: TaskFactoryParams): Task {
    return {
        cronSchedule: params.cronSchedule,
        start: async (schedule: ScheduledTask) => {
            try {
                const { services } = params;
                const serviceParams = <TaskServiceParams> { schedule, sharedObject: {} };

                for (let i = 0 ; i < services.length ; i++) {
                    const code = await services[i].run(serviceParams);
                    if (code && code === TaskServiceCode.STOP) {
                        break;
                    }
                }
            } catch (error) {
                logger.error((<Error> error).message);
                console.log(error);
            }
        }
    };
}