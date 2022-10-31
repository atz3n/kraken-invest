import { IKraken, logger } from "@atz3n/kraken-invest-lib";
import { ScheduledTask } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { IStateStore, State } from "./storage/state/IStateStore";
import { withdraw } from "./utils/funding";
import { buy } from "./utils/trading";


export async function initStateStore(stateStore: IStateStore): Promise<void> {
    const state = await stateStore.get();
    const pair = `${EnvVars.BASE_SYMBOL}${EnvVars.QUOTE_SYMBOL}`;

    if (!state || state.pair !== pair || state.schedule !== EnvVars.CRON_BUY_SCHEDULE) {
        await stateStore.upsert({
            counter: 0,
            pair,
            schedule: EnvVars.CRON_BUY_SCHEDULE,
            volume: 0
        });
    }
}


export async function buyConditionally(kraken: IKraken, stateStore: IStateStore): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let state = (await stateStore.get())!;
        if (EnvVars.NUMBER_OF_BUYS <= 0 || state.counter < EnvVars.NUMBER_OF_BUYS) {
            state = await buyAction(kraken, state);
            await stateStore.upsert(state);
        }
    } catch (error) {
        logger.error((<Error> error).message);
    }
}

async function buyAction(kraken: IKraken, state: State): Promise<State> {
    const volume = await buy({
        kraken,
        baseSymbol: EnvVars.BASE_SYMBOL,
        quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
        quoteSymbol: EnvVars.QUOTE_SYMBOL,
        volumeDecimals: EnvVars.VOLUME_DECIMAL
    });
    state.volume += volume;
    state.counter++;
    return state;
}


export async function stopAndWithdrawConditionally(
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

            if (EnvVars.ENABLE_WITHDRAWAL && state.volume > 0) {
                await sleep(60); // wait until order is filled
                await withdrawAction(kraken, state);
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

async function withdrawAction(kraken: IKraken, state: State): Promise<State> {
    await withdraw({
        kraken,
        volume: state.volume,
        baseSymbol: EnvVars.BASE_SYMBOL,
        withdrawalAddress: EnvVars.WITHDRAWAL_ADDRESS
    });
    state.volume = 0;
    return state;
}


export async function withdrawConditionally(kraken: IKraken, stateStore: IStateStore): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let state = (await stateStore.get())!;
        if (state.volume > 0) {
            state = await withdrawAction(kraken, state);
            await stateStore.upsert(state);
        }
    } catch (error) {
        logger.error((<Error> error).message);
    }
}