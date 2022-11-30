import { IKraken } from "@atz3n/kraken-invest-lib";
import { IAssetMapper } from "../lib/IAssetMapper";
import { ICoinGecko } from "../lib/ICoinGecko";
import { IStateStore } from "../storage/state/IStateStore";
import { Scheduler } from "./Scheduler";
import { createBuyTask } from "./tasks/buy/buy.controller";
import { createWithdrawalTask } from "./tasks/withdraw/withdrawal.controller";


interface Params {
    assetMapper: IAssetMapper;
    kraken: IKraken;
    coinGecko: ICoinGecko;
    stateStore: IStateStore;
}

export function initTasks(params : Params) {
    const withdrawalTask = createWithdrawalTask({
        assetMapper: params.assetMapper,
        coinGecko: params.coinGecko,
        kraken: params.kraken,
        stateStore: params.stateStore
    });
    const withdrawalScheduler = new Scheduler({ task: withdrawalTask });

    const buyTask = createBuyTask({
        assetMapper: params.assetMapper,
        coinGecko: params.coinGecko,
        kraken: params.kraken,
        stateStore: params.stateStore,
        withdrawalScheduler
    });
    const buyScheduler = new Scheduler({ task: buyTask });

    buyScheduler.start();
    withdrawalScheduler.start();
}