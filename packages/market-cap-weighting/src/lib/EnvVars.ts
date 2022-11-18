import dotenv from "dotenv";
import { BaseAsset } from "../types";


export enum RUN_CONTEXT {
    PRODUCTION,
    DEVELOPMENT,
    TEST
}


export class EnvVars {
    private static isInitialized = false;

    public static RUN_CONTEXT = RUN_CONTEXT.PRODUCTION;
    public static KRAKEN_PRIVATE_KEY = "";
    public static KRAKEN_API_KEY = "";
    public static QUOTE_SYMBOL = "";
    public static BASE_ASSETS: BaseAsset[] = [];
    public static QUOTE_INVESTING_AMOUNT = 0;
    public static NUMBER_OF_BUYS = 0;
    public static VOLUME_DECIMAL = 0;
    public static CRON_BUY_SCHEDULE = "";
    public static ENABLE_WITHDRAWAL = false;
    public static CRON_WITHDRAW_SCHEDULE = "";
    public static WITHDRAWAL_ADDRESS = "";
    public static ENABLE_FILE_LOGGING = false;
    public static MONGO_DB_URL = "";


    public static load(): void {
        if (this.isInitialized) {
            return;
        }
        this.isInitialized = true;

        this.set_RUN_CONTEXT();
        this.set_BASE_ASSETS();

        // this.setVar("KRAKEN_PRIVATE_KEY", (envVar) => {
        //     this.KRAKEN_PRIVATE_KEY = String(envVar);
        // });
        // this.setVar("KRAKEN_API_KEY", (envVar) => {
        //     this.KRAKEN_API_KEY = String(envVar);
        // });
        // this.setVar("QUOTE_SYMBOL", (envVar) => {
        //     this.QUOTE_SYMBOL = String(envVar);
        // });
        // this.setVar("BASE_SYMBOL", (envVar) => {
        //     this.BASE_SYMBOL = String(envVar);
        // });
        // this.setVar("QUOTE_INVESTING_AMOUNT", (envVar) => {
        //     this.QUOTE_INVESTING_AMOUNT = Number(envVar);
        // });
        // this.setVar("NUMBER_OF_BUYS", (envVar) => {
        //     this.NUMBER_OF_BUYS = Number(envVar);
        // }, -1);
        // this.setVar("VOLUME_DECIMAL", (envVar) => {
        //     this.VOLUME_DECIMAL = Number(envVar);
        // }, 5);
        // this.setVar("CRON_BUY_SCHEDULE", (envVar) => {
        //     this.CRON_BUY_SCHEDULE = String(envVar);
        // }, "0 3 * * 6");
        // this.setVar("ENABLE_WITHDRAWAL", (envVar) => {
        //     this.ENABLE_WITHDRAWAL = this.Boolean(envVar);
        // }, false);
        // this.setVar("CRON_WITHDRAW_SCHEDULE", (envVar) => {
        //     this.CRON_WITHDRAW_SCHEDULE = String(envVar);
        // }, "0 4 1 * *");
        // this.setVar("WITHDRAWAL_ADDRESS", (envVar) => {
        //     this.WITHDRAWAL_ADDRESS = String(envVar);
        // }, "");
        // if (this.ENABLE_WITHDRAWAL && this.WITHDRAWAL_ADDRESS === "") {
        //     throw new Error("WITHDRAWAL_ADDRESS must be defined");
        // }
        // this.setVar("ENABLE_FILE_LOGGING", (envVar) => {
        //     this.ENABLE_FILE_LOGGING = this.Boolean(envVar);
        // }, false);
        // this.setVar("MONGO_DB_URL", (envVar) => {
        //     this.MONGO_DB_URL = String(envVar);
        // }, "");
    }

    private static set_RUN_CONTEXT(): void {
        if (process.env.RUN_CONTEXT === "development") {
            this.RUN_CONTEXT = RUN_CONTEXT.DEVELOPMENT;
            dotenv.config();
        } else if (process.env.RUN_CONTEXT === "test") {
            this.RUN_CONTEXT = RUN_CONTEXT.TEST;
            dotenv.config({ path: __dirname + "/../../test/test.env" });
        } else {
            dotenv.config();
        }
    }

    private static set_BASE_ASSETS(): void {
        if (!process.env.BASE_ASSETS) {
            throw new Error("BASE_ASSETS must be defined");
        }

        try {
            const configs = JSON.parse(process.env.BASE_ASSETS);
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

    private static setVar(envVarName: string, cb: (variable: unknown) => void, defaultVar?: unknown): void {
        if (process.env[envVarName]) {
            cb(process.env[envVarName]);
        } else if (defaultVar !== undefined) {
            cb(defaultVar);
        } else {
            throw new Error(`${envVarName} must be defined`);
        }
    }

    private static Boolean(value: unknown): boolean {
        return value === true || value === "true";
    }
}

EnvVars.load();