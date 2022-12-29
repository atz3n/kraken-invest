import { IKraken, logger } from "@atz3n/kraken-invest-common";
import { EnvVars } from "../../../lib/EnvVars";
import { IAssetMapper } from "../../../lib/IAssetMapper";
import { ICoinGecko } from "../../../lib/ICoinGecko";
import { IStateStore } from "../../../storage/state/IStateStore";
import { Order, OrderRequest, Ratio } from "../../../types";
import { IScheduler } from "../../IScheduler";
import { createTask, Task } from "../../taskFactory";
import { CycleCounterCheckService } from "./cycleCounterCheck.service";
import { FundsCheckService } from "./fundsCheck.service";
import { BuyService } from "./buy.service";
import { OrderRequestsCalculationService } from "./orderRequestsCalculation.service";
import { RatiosCalculationService } from "./ratiosCalculation.service";


const ratios: Ratio[] = [];
const orderRequests: OrderRequest[] = [];


interface Params {
    stateStore: IStateStore;
    kraken: IKraken;
    assetMapper: IAssetMapper;
    coinGecko: ICoinGecko;
    withdrawalScheduler: IScheduler;
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
                    ratios.length = 0;
                    _ratios.forEach(ratio => ratios.push(ratio));
                }
            }),
            new OrderRequestsCalculationService({
                investingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
                quoteSymbol: EnvVars.QUOTE_SYMBOL,
                ratios,
                orderRequestsCb: (_orderRequests) => {
                    orderRequests.length = 0;
                    _orderRequests.forEach(orderRequest => orderRequests.push(orderRequest));
                }
            }),
            new BuyService({
                kraken: params.kraken,
                volumeDecimals: EnvVars.VOLUME_DECIMAL,
                orderRequests,
                minVolumeCb: (baseSymbol, volume, minVolume) => {
                    // eslint-disable-next-line max-len
                    logger.info(`Skipping ${baseSymbol}. Minimum requested volume: ${minVolume}, calculated volume: ${volume}.`);
                },
                buyCb: (orderId, volume, baseSymbol, quoteAmount, quoteSymbol) => {
                    // eslint-disable-next-line max-len
                    logger.info(`Set order ${orderId} to buy ${volume} ${baseSymbol} for ${quoteAmount.toFixed(2)} ${quoteSymbol}.`);
                },
                boughtCb: async (orders: Order[]) => {
                    let ratioText = "";
                    orders.forEach((order) => {
                        const [ ratio ] = ratios.filter(_ratio => _ratio.baseSymbol === order.baseSymbol);
                        ratioText += ` ${ratio.baseSymbol} = ${(ratio.ratio * 100).toFixed(2)}%,`;
                    });
                    if (ratioText) {
                        logger.info(`Order ratios:${ratioText.substring(0, ratioText.length - 1)}.`);
                    }

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