import { KRAKEN_PRIVATE_METHOD } from "@atz3n/kraken-invest-common";
import { ScheduledTask } from "node-cron";
import { EnvVars } from "../../src/lib/EnvVars";
import { createWithdrawalTask } from "../../src/schedule/tasks/withdraw/withdrawal.controller";
import { StateStoreInMemory } from "../../src/storage/state/StateStoreInMemory";
import { config } from "../config";
import { fail } from "../helpers";
import { KrakenMock } from "../mocks/KrakenMock";


let callTracker = "";
if (!config.skipTests.includes("withdraw")) {
    it("should withdraw assets", async () => {
        const stateStore = new StateStoreInMemory();
        stateStore.store.push({
            counter: 0,
            cumVolumes: [
                {
                    symbol: "BTC",
                    volume: 70,
                },
                {
                    symbol: "ETH",
                    volume: 20,
                },
                {
                    symbol: "LTC",
                    volume: 10,
                }
            ]
        });

        const withdrawTask = createWithdrawalTask({
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    if (method === KRAKEN_PRIVATE_METHOD.Balance) {
                        callTracker += "requestCbBalance ";
                        return {
                            result: {
                                BTC: 100,
                                ETH: 20,
                                LTC: 10
                            }
                        };
                    }

                    if (method === KRAKEN_PRIVATE_METHOD.Withdraw) {
                        callTracker += "requestCbWithdraw ";

                        if (params?.asset === "BTC") {
                            expect(params?.key).toEqual("dummy wallet");
                            expect(params?.amount).toEqual("70");
                            return {
                                result: {
                                    refid: "ref_BTC"
                                }
                            };
                        }
                    }

                    fail("should not reach here");
                }
            }),
            stateStore
        });

        await withdrawTask.start(<ScheduledTask> {});
        expect(withdrawTask.cronSchedule).toEqual(EnvVars.CRON_WITHDRAW_SCHEDULE);
        expect(callTracker.trim()).toEqual("requestCbBalance requestCbWithdraw");
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}