/* eslint-disable max-classes-per-file */
import winston, { format } from "winston";


export let logger = <winston.Logger> {};


export function initLogger(options: winston.LoggerOptions): void {
    options.levels = {
        error: 0,
        info: 1,
        debug: 2
    };
    logger = winston.createLogger(options);
}


export class ConsoleTransport extends winston.transports.Console {
    constructor() {
        super({
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            )
        });
    }
}