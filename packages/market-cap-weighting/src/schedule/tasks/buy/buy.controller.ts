import { IKraken, logger } from "@atz3n/kraken-invest-common";
import { IAssetMapper } from "../../../lib/IAssetMapper";
import { ICoinGecko } from "../../../lib/ICoinGecko";
import { EnvVars } from "../../../lib/EnvVars";
import { IStateStore } from "../../../storage/state/IStateStore";
import { Order, QuoteOrderRequest, Ratio } from "../../../types";
import { Scheduler } from "../../Scheduler";
import { createTask, Task } from "../../taskFactory";
import { CycleCounterCheckService } from "./cycleCounterCheck.service";
import { FundsCheckService } from "./fundsCheck.service";
import { QuoteBuyService } from "./quoteBuy.service";
import { QuoteRequestsCalculationService } from "./quoteOrderRequestsCalculaion.service";
import { RatiosCalculationService } from "./ratiosCalculation.service";


let ratios: Ratio[] = [];
let quoteOrderRequests: QuoteOrderRequest[] = [];


interface Params {
    stateStore: IStateStore;
    kraken: IKraken;
    assetMapper: IAssetMapper;
    coinGecko: ICoinGecko;
    withdrawalScheduler: Scheduler;
}

export function createBuyTask(params: Params): Task {
    return createTask({
        cronSchedule: EnvVars.CRON_BUY_SCHEDULE,
        services: [
            new FundsCheckService({
                kraken: params.kraken,
                quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
                quoteSymbol: EnvVars.QUOTE_SYMBOL
            }),
            new RatiosCalculationService({
                assetMapper: params.assetMapper,
                baseSymbols: (() => EnvVars.BASE_ASSETS.map(asset => asset.symbol))(),
                coinGecko: params.coinGecko,
                ratiosCb: (_ratios) => {
                    ratios = _ratios;
                }
            }),
            new QuoteRequestsCalculationService({
                quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
                quoteSymbol: EnvVars.QUOTE_SYMBOL,
                ratios,
                quoteOrderRequestsCb: (_quoteOrderRequests) => {
                    quoteOrderRequests = _quoteOrderRequests;
                }
            }),
            new QuoteBuyService({
                kraken: params.kraken,
                volumeDecimals: EnvVars.VOLUME_DECIMAL,
                quoteOrderRequests,
                buyCb: (orderId, volume, baseSymbol, quoteSymbol) => {
                    logger.info(`Set order ${orderId} to buy ${volume} ${baseSymbol} with ${quoteSymbol}`);
                },
                boughtCb: async (orders: Order[]) => {
                    await updateVolumes(params.stateStore, orders);
                }
            }),
            new CycleCounterCheckService({
                numberOfBuys: EnvVars.NUMBER_OF_BUYS,
                getCycleCounter: async () => {
                    const state = await params.stateStore.get();
                    return state.counter;
                },
                cycleCounterCb: async (cycleCounter) => {
                    const state = await params.stateStore.get();
                    state.counter = cycleCounter;
                    await params.stateStore.upsert(state);
                },
                withdrawalScheduler: params.withdrawalScheduler
            }),
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