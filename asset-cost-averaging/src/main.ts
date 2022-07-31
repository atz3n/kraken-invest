import { schedule } from "node-cron";
import { buyAction, checkNumberOfBuysAndStopConditionally, initStateStore, withdrawAction } from "./helpers";
import { EnvVars } from "./lib/EnvVars";
import { Kraken } from "./lib/Kraken";
import { createStateStore } from "./storage/state/stateStoreFactory";
import { StorageType } from "./storage/StorageType";
import { ConsoleTransport, FileTransport, initLogger, logger } from "./utils/logging";


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

    logger.info("Init schedules...");
    const kraken = new Kraken({
        apiKeySecret: EnvVars.KRAKEN_PRIVATE_KEY,
        apiKeyId: EnvVars.KRAKEN_API_KEY
    });

    const task = schedule(EnvVars.CRON_BUY_SCHEDULE, async () => {
        await buyAction(kraken, stateStore);
    });

    if (EnvVars.NUMBER_OF_BUYS > 0) {
        const interval = setInterval(() => {
            checkNumberOfBuysAndStopConditionally(kraken, interval, task, stateStore);
        }, 1000);
    } else if (EnvVars.ENABLE_WITHDRAWAL) {
        schedule(EnvVars.CRON_WITHDRAW_SCHEDULE, async () => {
            await withdrawAction(kraken, stateStore);
        });
    }

    logger.info("Done. Asset Cost Averaging Bot started.");
}


main();