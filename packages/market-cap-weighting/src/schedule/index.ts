import { Scheduler } from "./Scheduler";
import { createPingTask } from "./tasks/ping/ping.controller";


export function initSchedules() {
    const tasks = [
        createPingTask()
    ];

    tasks.forEach((task)  => {
        new Scheduler({ task }).start();
    });
}