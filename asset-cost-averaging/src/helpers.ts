import { ScheduledTask } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { IKraken } from "./lib/Kraken";
import { IStateStore } from "./storage/state/IStateStore";
import { withdraw } from "./utils/funding";
import { logger } from "./utils/logging";
import { buy } from "./utils/trading";


export async function initStateStore(stateStore: IStateStore): Promise<void> {
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


export async function buyAction(kraken: IKraken, stateStore: IStateStore): Promise<void> {
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


export async function checkNumberOfBuysAndStopConditionally(
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


export async function withdrawAction(kraken: IKraken, stateStore: IStateStore): Promise<void> {
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