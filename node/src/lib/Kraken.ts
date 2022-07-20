import axios from "axios";
import crypto from "crypto";
import { PRIVATE_METHOD, PUBLIC_METHOD } from "../constants";


export interface KrakenOptions {
    apiPublicKey: string;
    apiPrivateKey: string;
}


export class Kraken {
    public static readonly BASE_DOMAIN = "https://api.kraken.com";
    public static readonly PUBLIC_PATH = "/0/public/";
    public static readonly PRIVATE_PATH = "/0/private/";

    private readonly apiPublicKey?: string;
    private readonly apiPrivateKey?: string;


    constructor(options?: KrakenOptions) {
        this.apiPrivateKey = options?.apiPrivateKey;
        this.apiPublicKey = options?.apiPublicKey;
    }


    public async request(method: PRIVATE_METHOD | PUBLIC_METHOD, params?: string[]): Promise<object> {
        let response = {};
        let paramsString = "";

        params?.forEach(param => paramsString += param + "&");
        paramsString.slice(0, -1);

        if (Object.values(PRIVATE_METHOD).includes(<PRIVATE_METHOD> method)) {
            response = await this.queryPrivateEndpoint(<PRIVATE_METHOD> method, paramsString);
        }
        if (Object.values(PUBLIC_METHOD).includes(<PUBLIC_METHOD> method)) {
            response = await this.queryPublicEndpoint(<PUBLIC_METHOD> method, paramsString);
        }

        return response;
    }

    private async queryPublicEndpoint(apiMethod: PUBLIC_METHOD, inputParameters: string): Promise<object> {
        const url = Kraken.BASE_DOMAIN + Kraken.PUBLIC_PATH + apiMethod + "?" + inputParameters;
        const jsonData = await axios.get(url);
        return jsonData.data;
    }

    private async queryPrivateEndpoint(apiMethod: PRIVATE_METHOD, inputParameters: string): Promise<object> {
        const url = Kraken.BASE_DOMAIN + Kraken.PRIVATE_PATH + apiMethod;

        const nonce = Date.now().toString();
        const apiPostBodyData = "nonce=" + nonce + "&" + inputParameters;

        const signature = this.createAuthenticationSignature(
            this.apiPrivateKey || "",
            Kraken.PRIVATE_PATH,
            apiMethod,
            nonce,
            apiPostBodyData
        );

        const jsonData = await axios.post(url, apiPostBodyData, {
            headers: {
                "API-Key": this.apiPublicKey || "",
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
        const hash256 = (<any> sha256.update(apiPost)).digest("binary");
        const hmac512 = crypto.createHmac("sha512", secret);
        const signatureString = hmac512.update(apiPath + apiMethod + hash256, "binary").digest("base64");
        return signatureString;
    }
}