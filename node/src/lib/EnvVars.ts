import dotenv from "dotenv";


export enum RUN_CONTEXT {
    PRODUCTION,
    DEVELOPMENT,
    TEST
}


export class EnvVars {
    private static isInitialized = false;

    public static RUN_CONTEXT = RUN_CONTEXT.PRODUCTION;
    public static KRAKEN_API_PRIVATE_KEY = "";
    public static KRAKEN_API_PUBLIC_KEY = "";
    public static QUOTE_TICKER = "";
    public static BASE_TICKER = "";
    public static QUOTE_INVESTING_AMOUNT = 0;
    public static VOLUME_DECIMAL = 0;
    public static TRADE_CRON_SCHEDULE = "";
    public static WITHDRAW_CRON_SCHEDULE = "";
    public static WITHDRAWAL_ADDRESS = "";


    public static load(): void {
        if (this.isInitialized) {
            return;
        }
        this.isInitialized = true;

        this.set_RUN_CONTEXT();

        this.setVar("KRAKEN_API_PRIVATE_KEY", (envVar) => {
            this.KRAKEN_API_PRIVATE_KEY = String(envVar);
        });
        this.setVar("KRAKEN_API_PUBLIC_KEY", (envVar) => {
            this.KRAKEN_API_PUBLIC_KEY = String(envVar);
        });
        this.setVar("QUOTE_TICKER", (envVar) => {
            this.QUOTE_TICKER = String(envVar);
        }, "ZEUR");
        this.setVar("BASE_TICKER", (envVar) => {
            this.BASE_TICKER = String(envVar);
        }, "XXBT");
        this.setVar("QUOTE_INVESTING_AMOUNT", (envVar) => {
            this.QUOTE_INVESTING_AMOUNT = Number(envVar);
        }, 100);
        this.setVar("VOLUME_DECIMAL", (envVar) => {
            this.VOLUME_DECIMAL = Number(envVar);
        }, 5);
        this.setVar("TRADE_CRON_SCHEDULE", (envVar) => {
            this.TRADE_CRON_SCHEDULE = String(envVar);
        }, "0 3 * * 6");
        this.setVar("WITHDRAW_CRON_SCHEDULE", (envVar) => {
            this.WITHDRAW_CRON_SCHEDULE = String(envVar);
        }, "0 3 * * 6");
        this.setVar("WITHDRAWAL_ADDRESS", (envVar) => {
            this.WITHDRAWAL_ADDRESS = String(envVar);
        });
    }

    private static set_RUN_CONTEXT(): void {
        if (process.env.RUN_CONTEXT === "development") {
            this.RUN_CONTEXT = RUN_CONTEXT.DEVELOPMENT;
            dotenv.config();
        } else {
            dotenv.config();
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
}

EnvVars.load();