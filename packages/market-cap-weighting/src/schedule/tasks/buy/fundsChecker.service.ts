import { IKraken, KRAKEN_PRIVATE_METHOD } from "@atz3n/kraken-invest-lib";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    kraken: IKraken
    quoteSymbol: string;
    quoteInvestingAmount: number;
}

export class FundsCheckerService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const balances = await this.options.kraken.request<{ result: never }>(KRAKEN_PRIVATE_METHOD.Balance);
        if (balances.result[this.options.quoteSymbol] <= this.options.quoteInvestingAmount) {
            throw new Error("Not enough funds");
        }
    }
}
