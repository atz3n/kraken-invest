import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-common";


export interface Options {
    requestCb?(
        method: KRAKEN_PRIVATE_METHOD | KRAKEN_PUBLIC_METHOD,
        params?: Record<string, string> | undefined
    ): Promise<unknown>
}

export class KrakenMock implements IKraken {
    constructor(readonly options: Options) {}


    request<T>(
        method: KRAKEN_PRIVATE_METHOD | KRAKEN_PUBLIC_METHOD,
        params?: Record<string, string> | undefined
    ): Promise<T> {
        if (this.options.requestCb) {
            return <Promise<T>> this.options.requestCb(method, params);
        }
        return <Promise<T>> {};
    }
}