import { ConsoleTransport, FileTransport, initLogger, Kraken, logger } from "@atz3n/kraken-invest-lib";
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

main();