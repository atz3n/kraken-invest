import { schedule } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { Kraken } from "./lib/Kraken";
import { withdraw } from "./utils/funding";
import { buy } from "./utils/trading";


async function main() {
    const kraken = new Kraken({
        apiPrivateKey: EnvVars.KRAKEN_API_PRIVATE_KEY,
        apiPublicKey: EnvVars.KRAKEN_API_PUBLIC_KEY
    });

    schedule(EnvVars.TRADE_CRON_SCHEDULE, () => {
        buy(kraken);
    });

    schedule(EnvVars.WITHDRAW_CRON_SCHEDULE, () => {
        withdraw(kraken);
    });
}


main();