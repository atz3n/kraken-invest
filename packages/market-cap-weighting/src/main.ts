import { ConsoleTransport, FileTransport, initLogger, Kraken, logger } from "@atz3n/kraken-invest-lib";
import { schedule } from "node-cron";
import { buyConditionally, initStateStore, stopAndWithdrawConditionally, withdrawConditionally } from "./helpers";
import { AssetMapper } from "./lib/AssetMapper";
import { CoinGecko } from "./lib/CoinGecko";
import { EnvVars } from "./lib/EnvVars";
import { initTasks } from "./schedule";
import { createStateStore } from "./storage/state/stateStoreFactory";
import { StorageType } from "./storage/StorageType";


async function main() {
    initLogger({
        level: "info",
        transports: EnvVars.ENABLE_FILE_LOGGING
            ? [ new ConsoleTransport(), new FileTransport() ]
            : [ new ConsoleTransport() ]
    });

    logger.info("Init database...");
    const stateStore = createStateStore(EnvVars.MONGO_DB_URL
        ? StorageType.MONGO_DB
        : StorageType.IN_MEMORY
    );
    await initStateStore(stateStore);

    logger.info("Init asset mapper...");
    const assetMapper = new AssetMapper({
        location: "",
        resourceType: "file"
    });
    await assetMapper.updateMapping();

    logger.info("Init kraken...");
    const kraken = new Kraken({
        apiKeySecret: EnvVars.KRAKEN_PRIVATE_KEY,
        apiKeyId: EnvVars.KRAKEN_API_KEY
    });

    logger.info("Init coinGecko...");
    const coinGecko = new CoinGecko();

    logger.info("Init tasks...");
    const task = schedule(EnvVars.CRON_BUY_SCHEDULE, async () => {
        await buyConditionally(kraken, coinGecko, assetMapper, stateStore);
    });

    if (EnvVars.NUMBER_OF_BUYS > 0) {
        const interval = setInterval(() => {
            stopAndWithdrawConditionally(kraken, interval, task, stateStore);
        }, 1000);
    } else if (EnvVars.ENABLE_WITHDRAWAL) {
        schedule(EnvVars.CRON_WITHDRAW_SCHEDULE, async () => {
            await withdrawConditionally(kraken, stateStore);
        });
    }

    logger.info("Done. Asset Cost Averaging Bot started.");
}


// main();
// async function run() {
    // const kraken = new Kraken();
    // const resp = await kraken.request(KRAKEN_PUBLIC_METHOD.Assets);
    // console.log(resp);
//     const assetMapper = new AssetMapper({
//         resourceType: "file",
//         location: "asset-mapping.json"
//     });
//     const mappings = await assetMapper.init();
//     console.log(mappings);
//     const coinGecko = new CoinGecko();
//     const ids = mappings.map(mapping => mapping.coinGeckoId);
//     const coins = await coinGecko.getMarketCaps(ids);
//     console.log(coins);

//     let sum = 0;
//     const extendedCoins: {id: string, cap: number, ratio: number}[] = [];
//     coins.forEach(coin => sum += coin.cap);
//     console.log(sum);
//     coins.forEach((coin) => {
//         const ratio = coin.cap / sum;
//         extendedCoins.push({ ...coin, ...{ ratio } });
//     });
//     console.log(extendedCoins);

//     const investingAmount = 200;
//     extendedCoins.forEach((coin) => {
//         console.log(coin.id);
//         console.log(investingAmount * coin.ratio);
//     });

// }

// run();

async function run() {
    initLogger({
        level: "info",
        transports: EnvVars.ENABLE_FILE_LOGGING
            ? [ new ConsoleTransport(), new FileTransport() ]
            : [ new ConsoleTransport() ]
    });

    logger.info("Init database...");
    const storageType = EnvVars.MONGO_DB_URL ? StorageType.MONGO_DB : StorageType.IN_MEMORY;
    const stateStore = createStateStore(storageType);
    // await initStateStore(stateStore);

    logger.info("Init asset mapper...");
    const assetMapper = new AssetMapper({
        location: "",
        resourceType: "file"
    });
    await assetMapper.updateMapping();

    logger.info("Init kraken...");
    const kraken = new Kraken({
        apiKeySecret: EnvVars.KRAKEN_PRIVATE_KEY,
        apiKeyId: EnvVars.KRAKEN_API_KEY
    });

    logger.info("Init coinGecko...");
    const coinGecko = new CoinGecko();

    logger.info("Init tasks...");
    initTasks({
        assetMapper,
        coinGecko,
        kraken,
        stateStore
    });

    logger.info("Done. Market Cap Weighting Bot started.");
}

run();