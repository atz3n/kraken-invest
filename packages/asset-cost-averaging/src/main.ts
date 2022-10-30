import { schedule } from "node-cron";
import { buyConditionally, stopAndWithdrawConditionally, withdrawConditionally, initStateStore } from "./helpers";
import { EnvVars } from "./lib/EnvVars";
import { Kraken } from "lib";
import { createStateStore } from "./storage/state/stateStoreFactory";
import { StorageType } from "./storage/StorageType";
import { ConsoleTransport, FileTransport, initLogger, logger } from "lib";


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
        await buyConditionally(kraken, stateStore);
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


main();