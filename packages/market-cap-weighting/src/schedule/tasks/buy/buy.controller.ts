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


let ratios: Ratio[] = [];
let quoteOrderRequests: QuoteOrderRequest[] = [];


interface Params {
    stateStore: IStateStore;
    kraken: IKraken;
    assetMapper: IAssetMapper;
    coinGecko: ICoinGecko;
}

export function createBuyTask(params: Params): Task {
    return createTask({
        cronSchedule: EnvVars.CRON_BUY_SCHEDULE,
        services: [
            new CycleCheckerService({
                maxCycles: EnvVars.NUMBER_OF_BUYS,
                getCycleCount: async () => {
                    const state = await params.stateStore.get();
                    return state.counter;
                }
            }),
            new FundsCheckerService({
                kraken: params.kraken,
                quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
                quoteSymbol: EnvVars.QUOTE_SYMBOL
            }),
            new RatiosCalculatorService({
                assetMapper: params.assetMapper,
                baseSymbols: (() => EnvVars.BASE_ASSETS.map(asset => asset.symbol))(),
                coinGecko: params.coinGecko,
                ratiosCb: (_ratios) => {
                    ratios = _ratios;
                }
            }),
            new QuoteRequestsCalculatorService({
                quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
                quoteSymbol: EnvVars.QUOTE_SYMBOL,
                ratios,
                quoteOrderRequestsCb: (_quoteOrderRequests) => {
                    quoteOrderRequests = _quoteOrderRequests;
                }
            }),
            new QuoteBuyerService({
                kraken: params.kraken,
                volumeDecimals: EnvVars.VOLUME_DECIMAL,
                quoteOrderRequests,
                buyCb: (orderId, volume, baseSymbol, quoteSymbol) => {
                    logger.info(`Set order ${orderId} to buy ${volume} ${baseSymbol} with ${quoteSymbol}`);
                },
                boughtCb: async (orders: Order[]) => {
                    await updateVolumes(params.stateStore, orders);
                }
            })
        ]
    });
}

async function updateVolumes(stateStore: IStateStore, orders: Order[]): Promise<void> {
    const state = await stateStore.get();
    orders.forEach((order) => {
        for (let i = 0 ; i < state.cumVolumes.length ; i++) {
            if (order.baseSymbol === state.cumVolumes[i].symbol) {
                state.cumVolumes[i].volume += order.volume;
            }
        }
    });
    await stateStore.upsert(state);
}