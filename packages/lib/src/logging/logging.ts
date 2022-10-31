/* eslint-disable max-classes-per-file */
import winston, { format } from "winston";
import Transport from "winston-transport";


export let logger = <winston.Logger> {};


export function initLogger(options: winston.LoggerOptions): void {
    options.levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
    };
    logger = winston.createLogger(options);
}


export class DummyTransport extends Transport {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public log(info: unknown, callback: unknown): void {}
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


export class FileTransport extends winston.transports.File {
    constructor() {
        super({
            dirname: "logs",
            filename: "log.log",
            maxsize: 2 * 1024 * 1024, // 2MB
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            )
        });
    }
}