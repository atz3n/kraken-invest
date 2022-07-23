import { schedule } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { Kraken } from "./lib/Kraken";
import { withdraw } from "./utils/funding";
import { ConsoleTransport, initLogger, logger } from "./utils/logging";
import { buy } from "./utils/trading";


function main() {
    initLogger({
        level: "info",
        transports: [
            new ConsoleTransport()
        ]
    });

    const kraken = new Kraken({
        privateKey: EnvVars.KRAKEN_PRIVATE_KEY,
        apiKey: EnvVars.KRAKEN_API_KEY
    });

    schedule(EnvVars.TRADE_CRON_SCHEDULE, () => {
        buy(kraken);
    });

    if (EnvVars.ENABLE_WITHDRAWAL) {
        schedule(EnvVars.WITHDRAW_CRON_SCHEDULE, () => {
            withdraw(kraken);
        });
    }
    logger.info("Asset Cost Average Bot started.");
}

main();