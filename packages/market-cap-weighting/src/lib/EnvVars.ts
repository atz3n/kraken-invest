import { AEnvVars } from "@atz3n/kraken-invest-common";
import { BaseAsset } from "../types";


export class EnvVars extends AEnvVars {
    public static KRAKEN_PRIVATE_KEY = "";
    public static KRAKEN_API_KEY = "";
    public static QUOTE_SYMBOL = "";
    public static BASE_ASSETS: BaseAsset[] = [];
    public static QUOTE_INVESTING_AMOUNT = 0;
    public static NUMBER_OF_BUYS = 0;
    public static VOLUME_DECIMAL = 0;
    public static CRON_BUY_SCHEDULE = "";
    public static CRON_WITHDRAW_SCHEDULE = "";
    public static ENABLE_FILE_LOGGING = false;
    public static MONGO_DB_URL = "";


    public static load(): void {
        this._load(() => {
            this.set_BASE_ASSETS();

            this.setVar("KRAKEN_PRIVATE_KEY", (envVar) => {
                this.KRAKEN_PRIVATE_KEY = String(envVar);
            });
            this.setVar("KRAKEN_API_KEY", (envVar) => {
                this.KRAKEN_API_KEY = String(envVar);
            });
            this.setVar("QUOTE_SYMBOL", (envVar) => {
                this.QUOTE_SYMBOL = String(envVar);
            });
            this.setVar("QUOTE_INVESTING_AMOUNT", (envVar) => {
                this.QUOTE_INVESTING_AMOUNT = Number(envVar);
            });
            this.setVar("NUMBER_OF_BUYS", (envVar) => {
                this.NUMBER_OF_BUYS = Number(envVar);
            }, -1);
            this.setVar("VOLUME_DECIMAL", (envVar) => {
                this.VOLUME_DECIMAL = Number(envVar);
            }, 5);
            this.setVar("CRON_BUY_SCHEDULE", (envVar) => {
                this.CRON_BUY_SCHEDULE = String(envVar);
            });
            this.setVar("CRON_WITHDRAW_SCHEDULE", (envVar) => {
                this.CRON_WITHDRAW_SCHEDULE = String(envVar);
            }, "0 0 0 1 1 ? 1970"); // a date in the past. Will never execute
            this.setVar("ENABLE_FILE_LOGGING", (envVar) => {
                this.ENABLE_FILE_LOGGING = this.Boolean(envVar);
            }, false);
            this.setVar("MONGO_DB_URL", (envVar) => {
                this.MONGO_DB_URL = String(envVar);
            }, "");
        }, { testEnv: __dirname + "/../../test/test.env" });
    }

    private static set_BASE_ASSETS(): void {
        if (!process.env.BASE_ASSETS) {
            throw new Error("BASE_ASSETS must be defined");
        }

        try {
            const configs = JSON.parse(process.env.BASE_ASSETS);
            if (!Array.isArray(configs)) {
                throw new Error();
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            configs.forEach((config: any) => {
                if (!Array.isArray(config)) {
                    this.BASE_ASSETS.push({
                        symbol: config,
                        withdrawAddress: ""
                    });
                    return;
                }

                this.BASE_ASSETS.push({
                    symbol: config[0],
                    withdrawAddress: config[1] || ""
                });
            });
        } catch (error) {
            let message = "";
            message += "Could not load BASE_ASSETS\n";
            message += "supported configuration format:\n";
            message += "[[\"<symbol>\", \"<wallet address>\"], [\"<symbol>\"], \"<symbol>\"]\n";
            message += "for example:\n";
            message += "[[\"BTC\", \"My BTC Wallet\"], [\"ETH\"], \"LTC\"]\n";
            throw new Error(message);
        }
    }
}

EnvVars.load();