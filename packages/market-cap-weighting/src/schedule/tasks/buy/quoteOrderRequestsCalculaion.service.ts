import { QuoteOrderRequest, Ratio } from "../../../types";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    ratios: Ratio[];
    quoteSymbol: string;
    quoteInvestingAmount: number;
    quoteOrderRequestsCb: (quoteOrderRequests: QuoteOrderRequest[]) => Promise<void> | void;
}

export class QuoteRequestsCalculationService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const quoteOrderRequests: QuoteOrderRequest [] = [];

        this.options.ratios.forEach((ratio) => {
            quoteOrderRequests.push({
                baseSymbol: ratio.baseSymbol,
                quoteAmount: ratio.ratio * this.options.quoteInvestingAmount,
                quoteSymbol: this.options.quoteSymbol
            });
        });
        await this.options.quoteOrderRequestsCb(quoteOrderRequests);
    }
}
