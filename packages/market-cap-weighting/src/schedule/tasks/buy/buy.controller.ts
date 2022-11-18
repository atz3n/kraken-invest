import { IKraken, logger } from "@atz3n/kraken-invest-lib";
import { IAssetMapper } from "../../../lib/AssetMapper";
import { ICoinGecko } from "../../../lib/CoinGecko";
import { EnvVars } from "../../../lib/EnvVars";
import { IStateStore } from "../../../storage/state/IStateStore";
import { Order, QuoteOrderRequest, Ratio } from "../../../types";
import { createTask, Task } from "../../taskFactory";
import { CycleCheckerService } from "./cycleChecker.service";
import { FundsCheckerService } from "./fundsChecker.service";
import { QuoteBuyerService } from "./quoteBuyer.service";
import { QuoteRequestsCalculatorService } from "./quoteOrderRequestsCalculator.service";
import { RatiosCalculatorService as RatiosCalculatorService } from "./ratioCalculator.service";


interface Params {
    stateStore: IStateStore;
    kraken: IKraken;
    assetMapper: IAssetMapper;
    coinGecko: ICoinGecko;
}

let ratios: Ratio[] = [];
let quoteOrderRequests: QuoteOrderRequest[] = [];


export function createBuyTask(params: Params): Task {
    return createTask({
        cronSchedule: EnvVars.CRON_BUY_SCHEDULE,
        services: [
            new CycleCheckerService({
                maxCycles: EnvVars.NUMBER_OF_BUYS,
                stateStore: params.stateStore
            }),
            new FundsCheckerService({
                kraken: params.kraken,
                quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
                quoteSymbol: EnvVars.QUOTE_SYMBOL
            }),
            new RatiosCalculatorService({
                assetMapper: params.assetMapper,
                baseSymbols: [EnvVars.BASE_SYMBOL],
                coinGecko: params.coinGecko,
                ratiosCb
            }),
            new QuoteRequestsCalculatorService({
                quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
                quoteSymbol: EnvVars.QUOTE_SYMBOL,
                ratios,
                quoteOrderRequestsCb
            }),
            new QuoteBuyerService({
                kraken: params.kraken,
                volumeDecimals: EnvVars.VOLUME_DECIMAL,
                quoteOrderRequests,
                buyCb,
                boughtCb
            })
        ]
    });
}

function ratiosCb(_ratios: Ratio[]): void {
    ratios = _ratios;
}

function quoteOrderRequestsCb(_quoteOrderRequests: QuoteOrderRequest[]): void {
    quoteOrderRequests = _quoteOrderRequests;
}

function buyCb(orderId: string, volume: string, baseSymbol: string, quoteSymbol: string): void {
    logger.info(`Set order ${orderId} to buy ${volume} ${baseSymbol} with ${quoteSymbol}`);
}

function boughtCb(orders: Order[]) {
    console.log(orders);
}