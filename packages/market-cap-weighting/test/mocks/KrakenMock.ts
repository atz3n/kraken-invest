import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-lib";


export interface Options {
    requestCb?<T>(
        method: KRAKEN_PRIVATE_METHOD | KRAKEN_PUBLIC_METHOD,
        params?: Record<string, string> | undefined
    ): Promise<T>
}

export class KrakenMock implements IKraken {
    constructor(readonly options: Options) {}


    request<T>(
        method: KRAKEN_PRIVATE_METHOD | KRAKEN_PUBLIC_METHOD,
        params?: Record<string, string> | undefined
    ): Promise<T> {
        if (this.options.requestCb) {
            return this.options.requestCb(method, params);
        }
        return <Promise<T>> {};
    }
}