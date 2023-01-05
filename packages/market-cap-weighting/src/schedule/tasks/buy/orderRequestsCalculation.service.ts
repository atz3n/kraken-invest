import { OrderRequest, Ratio } from "../../../types";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    ratios: Ratio[];
    quoteSymbol: string;
    investingAmount: number;
    orderRequestsCb: (orderRequests: OrderRequest[]) => Promise<void> | void;
}

export class OrderRequestsCalculationService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const orderRequests: OrderRequest [] = [];

        this.options.ratios.forEach((ratio) => {
            orderRequests.push({
                baseSymbol: ratio.baseSymbol,
                quoteAmount: ratio.ratio * this.options.investingAmount,
                quoteSymbol: this.options.quoteSymbol
            });
        });
        await this.options.orderRequestsCb(orderRequests);
    }
}
