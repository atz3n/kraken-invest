import { TaskService, TaskServiceCode, TaskServiceParams } from "../../taskFactory";


interface Options {
    shouldWithdraw: boolean;
}

export class WithdrawalCheckService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<TaskServiceCode> {
        return this.options.shouldWithdraw ? TaskServiceCode.CONTINUE : TaskServiceCode.STOP;
    }
}