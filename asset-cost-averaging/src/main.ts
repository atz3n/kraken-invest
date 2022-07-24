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

    schedule(EnvVars.CRON_BUY_SCHEDULE, async () => {
        try {
            await buy(kraken);
        } catch (error) {
            logger.error((<Error> error).message);
        }
    });

    if (EnvVars.ENABLE_WITHDRAWAL) {
        schedule(EnvVars.CRON_WITHDRAW_SCHEDULE, async () => {
            try {
                await withdraw(kraken);
            } catch (error) {
                logger.error((<Error> error).message);
            }
        });
    }

    logger.info("Asset Cost Average Bot started.");
}

main();