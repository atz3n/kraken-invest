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
    public static MAPPING_URI = "";


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
            }, "0 0 31 2 *"); // on February 31st. Will never execute
            this.setVar("ENABLE_FILE_LOGGING", (envVar) => {
                this.ENABLE_FILE_LOGGING = this.Boolean(envVar);
            }, false);
            this.setVar("MONGO_DB_URL", (envVar) => {
                this.MONGO_DB_URL = String(envVar);
            }, "");
            this.setVar("MAPPING_URI", (envVar) => {
                this.MAPPING_URI = String(envVar);
            }, "https://raw.githubusercontent.com/atz3n/kraken-invest/main/packages/market-cap-weighting/asset-mapping.json");
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
                        withdrawAddress: "",
                        weight: 1
                    });
                    return;
                }

                let weight = 1;
                let withdrawAddress = "";
                for (let i = 1 ; i < config.length ; i++) {
                    if (typeof config[i] === "string") {
                        withdrawAddress = config[i];
                    }
                    if (typeof config[i] === "number") {
                        weight = config[i];
                    }
                }

                this.BASE_ASSETS.push({
                    symbol: config[0],
                    withdrawAddress,
                    weight
                });
            });
        } catch (error) {
            let message = "";
            message += "Could not load BASE_ASSETS\n";
            message += "supported configuration formats (<> => required, {} => optional):\n";
            message += "[[\"<symbol>\", \"{wallet address}\", {weight}], [\"<symbol>\", {weight}, \"{wallet address}\"], [\"<symbol>\"], \"<symbol>\"]\n";
            message += "for example:\n";
            message += "[[\"BTC\", \"My BTC Wallet\", 0.5], [\"ETH\", 0.7], \"LTC\", [\"DOT\"]]\n";
            throw new Error(message);
        }
    }
}

EnvVars.load();