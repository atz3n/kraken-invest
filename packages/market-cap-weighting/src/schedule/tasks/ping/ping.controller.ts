import { createTask, Task } from "../../taskFactory";


export function createPingTask(): Task {
    return createTask({
        cronSchedule: "* * * * * *",
        services: [
            {
                run(params) {
                    console.log("PING");
                },
            }
        ]
    });
}