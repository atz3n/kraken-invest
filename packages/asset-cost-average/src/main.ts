import { schedule } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { Kraken } from "./lib/Kraken";
import { withdraw } from "./utils/funding";
import { ConsoleTransport, initLogger } from "./utils/logging";
import { buy } from "./utils/trading";


function main() {
    initLogger({
        level: "info",
        transports: [
            new ConsoleTransport()
        ]
    });

    const kraken = new Kraken({
        apiPrivateKey: EnvVars.KRAKEN_API_PRIVATE_KEY,
        apiPublicKey: EnvVars.KRAKEN_API_PUBLIC_KEY
    });

    schedule(EnvVars.TRADE_CRON_SCHEDULE, () => {
        buy(kraken);
    });

    if (EnvVars.ENABLE_WITHDRAWAL) {
        schedule(EnvVars.WITHDRAW_CRON_SCHEDULE, () => {
            withdraw(kraken);
        });
    }
}

main();