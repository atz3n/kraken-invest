import { schedule, ScheduledTask } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { IKraken, Kraken } from "./lib/Kraken";
import { IStateStore } from "./storage/state/IStateStore";
import { createStateStore } from "./storage/state/stateStoreFactory";
import { StorageType } from "./storage/StorageType";
import { withdraw } from "./utils/funding";
import { ConsoleTransport, FileTransport, initLogger, logger } from "./utils/logging";
import { buy } from "./utils/trading";


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

async function initStateStore(stateStore: IStateStore): Promise<void> {
    const state = await stateStore.get();
    const pair = `${EnvVars.BASE_SYMBOL}${EnvVars.QUOTE_INVESTING_AMOUNT}`;

    if (!state || state.pair !== pair || state.schedule !== EnvVars.CRON_BUY_SCHEDULE) {
        await stateStore.upsert({
            counter: 0,
            pair: `${EnvVars.BASE_SYMBOL}${EnvVars.QUOTE_INVESTING_AMOUNT}`,
            schedule: EnvVars.CRON_BUY_SCHEDULE,
            volume: 0
        });
    }
}

async function buyAction(kraken: IKraken, stateStore: IStateStore): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const state = (await stateStore.get())!;
        state.volume += await buy({
            kraken,
            baseSymbol: EnvVars.BASE_SYMBOL,
            quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
            quoteSymbol: EnvVars.QUOTE_SYMBOL,
            volumeDecimals: EnvVars.VOLUME_DECIMAL
        });
        state.counter++;
        await stateStore.upsert(state);
    } catch (error) {
        logger.error((<Error> error).message);
    }
}

async function checkNumberOfBuysAndStopConditionally(
    kraken: IKraken,
    interval: NodeJS.Timeout,
    task: ScheduledTask,
    stateStore: IStateStore
): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const state = (await stateStore.get())!;
        if (state.counter >= EnvVars.NUMBER_OF_BUYS) {
            task.stop();
            clearInterval(interval);

            if (EnvVars.ENABLE_WITHDRAWAL) {
                await sleep(60); // wait until order is filled
                await withdrawAction(kraken, stateStore);
                await stateStore.delete();
            }
        }
    } catch (error) {
        logger.error((<Error> error).message);
    }
}

async function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function withdrawAction(kraken: IKraken, stateStore: IStateStore): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const state = (await stateStore.get())!;
        await withdraw({
            kraken,
            volume: state.volume,
            baseSymbol: EnvVars.BASE_SYMBOL,
            withdrawalAddress: EnvVars.WITHDRAWAL_ADDRESS
        });
        state.volume = 0;
        await stateStore.upsert(state);
    } catch (error) {
        logger.error((<Error> error).message);
    }
}


main();