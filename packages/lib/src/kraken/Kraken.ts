import axios from "axios";
import crypto from "crypto";


export enum KRAKEN_PRIVATE_METHOD {
    Balance = "Balance",
    BalanceEx = "BalanceEx",
    TradeBalance = "TradeBalance",
    OpenOrders = "OpenOrders",
    ClosedOrders = "ClosedOrders",
    QueryOrders = "QueryOrders",
    TradesHistory = "TradesHistory",
    QueryTrades = "QueryTrades",
    OpenPositions = "OpenPositions",
    Ledgers = "Ledgers",
    QueryLedgers = "QueryLedgers",
    TradeVolume = "TradeVolume",
    AddExport = "AddExport",
    ExportStatus = "ExportStatus",
    RetrieveExport = "RetrieveExport",
    RemoveExport = "RemoveExport",
    GetWebSocketsToken = "GetWebSocketsToken",
    AddOrder = "AddOrder",
    AddOrderBatch = "AddOrderBatch",
    EditOrder = "EditOrder",
    CancelOrder = "CancelOrder",
    CancelAll = "CancelAll",
    CancelAllOrdersAfter = "CancelAllOrdersAfter",
    DepositMethods = "DepositMethods",
    DepositAddresses = "DepositAddresses",
    DepositStatus = "DepositStatus",
    WithdrawInfo = "WithdrawInfo",
    Withdraw = "Withdraw",
    WithdrawStatus = "WithdrawStatus",
    WithdrawCancel = "WithdrawCancel",
    WalletTransfer = "WalletTransfer",
    StakingAsset= "Staking/Assets",
    Stake = "Stake",
    Unstake = "Unstake",
    StakingPending = "Staking/Pending",
    StakingTransactions = "Staking/Transactions"
}

export enum KRAKEN_PUBLIC_METHOD {
    Time = "Time",
    Assets = "Assets",
    AssetPairs = "AssetPairs",
    Ticker = "Ticker",
    OHLC = "OHLC",
    Depth = "Depth",
    Trades = "Trades",
    Spread = "Spread",
    SystemStatus = "SystemStatus"
}


export interface IKraken {
    request<T>(method: KRAKEN_PRIVATE_METHOD | KRAKEN_PUBLIC_METHOD, params?: Record<string, string>): Promise<T>;
}


export interface KrakenOptions {
    apiKeyId: string;
    apiKeySecret: string;
}


export class Kraken implements IKraken {
    public static readonly BASE_DOMAIN = "https://api.kraken.com";
    public static readonly PUBLIC_PATH = "/0/public/";
    public static readonly PRIVATE_PATH = "/0/private/";

    private readonly apiKeyId?: string;
    private readonly apiKeySecret?: string;


    constructor(options?: KrakenOptions) {
        this.apiKeySecret = options?.apiKeySecret;
        this.apiKeyId = options?.apiKeyId;
    }


    public async request<T>(
        method: KRAKEN_PRIVATE_METHOD | KRAKEN_PUBLIC_METHOD,
        params?: Record<string, string>
    ): Promise<T> {
        let response = <{error: []}> {};
        let paramsString = "";

        if (params) {
            for (const [key, value] of Object.entries(params)) {
                paramsString += key + "=" + value + "&";
            }
            paramsString = paramsString.slice(0, -1);
        }

        if (Object.values(KRAKEN_PRIVATE_METHOD).includes(<KRAKEN_PRIVATE_METHOD> method)) {
            response = <{error: []}> await this.queryPrivateEndpoint(<KRAKEN_PRIVATE_METHOD> method, paramsString);
        }
        if (Object.values(KRAKEN_PUBLIC_METHOD).includes(<KRAKEN_PUBLIC_METHOD> method)) {
            response = <{error: []}> await this.queryPublicEndpoint(<KRAKEN_PUBLIC_METHOD> method, paramsString);
        }

        if (response.error.length > 0) {
            throw new Error(JSON.stringify(response.error));
        }

        return <T> <unknown> response;
    }

    private async queryPublicEndpoint(apiMethod: KRAKEN_PUBLIC_METHOD, inputParameters: string): Promise<unknown> {
        const url = Kraken.BASE_DOMAIN + Kraken.PUBLIC_PATH + apiMethod + "?" + inputParameters;
        const jsonData = await axios.get(url);
        return jsonData.data;
    }

    private async queryPrivateEndpoint(apiMethod: KRAKEN_PRIVATE_METHOD, inputParameters: string): Promise<unknown> {
        const url = Kraken.BASE_DOMAIN + Kraken.PRIVATE_PATH + apiMethod;

        const nonce = Date.now().toString();
        const apiPostBodyData = "nonce=" + nonce + "&" + inputParameters;

        const signature = this.createAuthenticationSignature(
            this.apiKeySecret || "",
            Kraken.PRIVATE_PATH,
            apiMethod,
            nonce,
            apiPostBodyData
        );

        const jsonData = await axios.post(url, apiPostBodyData, {
            headers: {
                "API-Key": this.apiKeyId || "",
                "API-Sign": signature
            },
            responseType: "arraybuffer"
        });
        return JSON.parse(jsonData.data.toString());
    }

    private createAuthenticationSignature(
        apiPrivateKey: string,
        apiPath: string,
        apiMethod: string,
        nonce: string,
        apiPostBodyData: string
    ) {
        const apiPost = nonce + apiPostBodyData;
        const secret = Buffer.from(apiPrivateKey, "base64");
        const sha256 = crypto.createHash("sha256");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hash256 = (<any> sha256.update(apiPost)).digest("binary");
        const hmac512 = crypto.createHmac("sha512", secret);
        const signatureString = hmac512.update(apiPath + apiMethod + hash256, "binary").digest("base64");
        return signatureString;
    }
}