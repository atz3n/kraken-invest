import { IKraken } from "@atz3n/kraken-invest-lib";
import { IAssetMapper } from "../lib/AssetMapper";
import { ICoinGecko } from "../lib/CoinGecko";
import { IStateStore } from "../storage/state/IStateStore";
import { Scheduler } from "./Scheduler";
import { createBuyTask } from "./tasks/buy/buy.controller";
import { createPingTask } from "./tasks/ping/ping.controller";

interface Params {
    assetMapper: IAssetMapper;
    kraken: IKraken;
    coinGecko: ICoinGecko;
    stateStore: IStateStore;
}

export function initTasks(params : Params) {
    const tasks = [
        createPingTask(),
        createBuyTask({
            assetMapper: params.assetMapper,
            coinGecko: params.coinGecko,
            kraken: params.kraken,
            stateStore: params.stateStore
        })
    ];

    tasks.forEach((task)  => {
        new Scheduler({ task }).start();
    });
}