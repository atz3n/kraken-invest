import { Task } from "./taskFactory";

export interface IScheduler {
    getTask(): Task;
    start(): void;
    stop(): void;
}