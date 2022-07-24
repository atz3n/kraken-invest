import { schedule } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { Kraken } from "./lib/Kraken";
import { withdraw } from "./utils/funding";
import { ConsoleTransport, FileTransport, initLogger, logger } from "./utils/logging";
import { buy } from "./utils/trading";


function main() {
    initLogger({
        level: "info",
        transports: EnvVars.ENABLE_FILE_LOGGING
            ? [ new ConsoleTransport(), new FileTransport() ]
            : [ new ConsoleTransport() ]
    });

    const kraken = new Kraken({
        apiKeySecret: EnvVars.KRAKEN_PRIVATE_KEY,
        apiKeyId: EnvVars.KRAKEN_API_KEY
    });

    let counter = 0;
    const task = schedule(EnvVars.CRON_BUY_SCHEDULE, async () => {
        await buyAction(kraken);
        counter++;
    });

    if (EnvVars.NUMBER_OF_BUYS > 0) {
        const interval = setInterval(async () => {
            if (counter >= EnvVars.NUMBER_OF_BUYS) {
                task.stop();
                clearInterval(interval);

                if (EnvVars.ENABLE_WITHDRAWAL) {
                    await sleep(60); // wait until order is filled
                    await withdrawAction(kraken);
                }
            }
        }, 1000);
    } else if (EnvVars.ENABLE_WITHDRAWAL) {
        schedule(EnvVars.CRON_WITHDRAW_SCHEDULE, async () => {
            await withdrawAction(kraken);
        });
    }

    logger.info("Asset Cost Average Bot started.");
}

async function buyAction(kraken: Kraken): Promise<void> {
    try {
        await buy(kraken);
    } catch (error) {
        logger.error((<Error> error).message);
    }
}

async function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function withdrawAction(kraken: Kraken): Promise<void> {
    try {
        await withdraw(kraken);
    } catch (error) {
        logger.error((<Error> error).message);
    }
}


main();