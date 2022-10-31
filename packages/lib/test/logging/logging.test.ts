import Transport from "winston-transport";
import { initLogger, logger } from "../../src";
import { config } from "../config";
import { LOG_MESSAGE } from "../data";


// mock logger transports
let _info = { level: "", message: "" };
class MockTransport extends Transport {
    public log(info: {level: string, message: string}, callback: unknown): void {
        _info = info;
    }
}

if (!config.skipTests.includes("logging")) {
    beforeEach(() => {
        initLogger({
            level: "debug",
            transports: [ new MockTransport() ]
        });
    });


    it("should log a message in log level info", () => {
        logger.info(LOG_MESSAGE);
        expect(_info.level).toEqual("info");
        expect(_info.message).toEqual(LOG_MESSAGE);
    });


    it("should log a message in log level error", () => {
        logger.error(LOG_MESSAGE);
        expect(_info.level).toEqual("error");
        expect(_info.message).toEqual(LOG_MESSAGE);
    });


    it("should log a message in log level warn", () => {
        logger.warn(LOG_MESSAGE);
        expect(_info.level).toEqual("warn");
        expect(_info.message).toEqual(LOG_MESSAGE);
    });


    it("should log a message in log level debug", () => {
        logger.debug(LOG_MESSAGE);
        expect(_info.level).toEqual("debug");
        expect(_info.message).toEqual(LOG_MESSAGE);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}