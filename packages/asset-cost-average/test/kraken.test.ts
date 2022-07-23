import { EnvVars } from "../src/lib/EnvVars";
import { Kraken, PRIVATE_METHOD, PUBLIC_METHOD } from "../src/lib/Kraken";
import { config } from "./config";
import crypto from "crypto";


// mock axios
interface Config {
    headers: {
        "API-Key": string,
        "API-Sign": string
    },
        responseType: string
}
jest.mock("axios", () => {
    return {
        get: async (url: string, data: never): Promise<unknown> => {
            try {
                expect(url.includes("https://api.kraken.com/0/public/Time")).toBeTruthy();
                return {
                    data: {
                        error: [],
                        result: {
                            some: "data"
                        }
                    }
                };
            } catch (error) {
                console.error((<Error> error).message);
                throw error;
            }
        },
        post: async (url: string, data: string, config: Config): Promise<unknown> => {
            try {
                expect(url.includes("https://api.kraken.com/0/private/AddOrder")).toBeTruthy();
                const dataArray = data.split("&");

                const nonceArray = dataArray[0].split("=");
                const orderTypeArray = dataArray[1].split("=");
                const typeArray = dataArray[2].split("=");
                const pairArray = dataArray[3].split("=");
                const volumeArray = dataArray[4].split("=");

                expect(nonceArray[0]).toEqual("nonce");
                expect(orderTypeArray[0]).toContain("ordertype");
                expect(orderTypeArray[1]).toContain("market");
                expect(typeArray[0]).toContain("type");
                expect(typeArray[1]).toContain("buy");
                expect(pairArray[0]).toContain("pair");
                expect(pairArray[1]).toContain("XXBTZEUR");
                expect(volumeArray[0]).toContain("volume");
                expect(volumeArray[1]).toContain("0.1");

                expect(config.responseType).toEqual("arraybuffer");
                expect(config.headers["API-Key"]).toEqual(EnvVars.KRAKEN_API_KEY);
                expect(config.headers["API-Sign"]).toEqual(createSignature(nonceArray[1], EnvVars.KRAKEN_PRIVATE_KEY));

                return {
                    data: JSON.stringify({
                        error: [],
                        result: {
                            txid: ["someId"]
                        }
                    })
                };
            } catch (error) {
                console.error((<Error> error).message);
                throw error;
            }
        }
    };
});

function createSignature(nonce: string, krakenSecret: string) {
    const apiPost = nonce + "nonce=" + nonce + "&ordertype=market&type=buy&pair=XXBTZEUR&volume=0.1";
    const secret = Buffer.from(krakenSecret, "base64");
    const sha256 = crypto.createHash("sha256");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hash256 = (<any> sha256.update(apiPost)).digest("binary");
    const hmac512 = crypto.createHmac("sha512", secret);
    const signatureString = hmac512.update("/0/private/AddOrder" + hash256, "binary").digest("base64");
    return signatureString;
}


if (!config.skipTests.includes("kraken")) {
    it("should send a public method as GET request", async () => {
        const kraken = new Kraken();
        const response = await kraken.request<{result: { some: string }}>(PUBLIC_METHOD.Time);
        expect(response.result.some).toEqual("data");
    });


    it("should send a private method as a signed POST request", async () => {
        const kraken = new Kraken({
            apiKeyId: EnvVars.KRAKEN_API_KEY,
            apiKeySecret: EnvVars.KRAKEN_PRIVATE_KEY
        });
        const response = await kraken.request<{result: { txid: string[] }}>(PRIVATE_METHOD.AddOrder, {
            ordertype: "market",
            type: "buy",
            pair: "XXBTZEUR",
            volume: "0.1"
        });
        expect(response.result.txid[0]).toEqual("someId");
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}