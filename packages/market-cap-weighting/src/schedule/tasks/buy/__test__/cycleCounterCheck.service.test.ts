import { config } from "../../../../../test/config";
import { fail } from "../../../../../test/helpers";
import { SchedulerMock } from "../../../../../test/mocks/SchedulerMock";
import { TaskServiceParams } from "../../../taskFactory";
import { CycleCounterCheckService } from "../cycleCounterCheck.service";


if (!config.skipTests.includes("cycleCounterCheck")) {
    it("should increase the cycle counter", async () => {
        let callTracker = "";
        const service = new CycleCounterCheckService({
            numberOfBuys: 2,
            getCycleCounter: () => 0,
            cycleCounterCb: (cycleCount) => {
                callTracker += "cycleCounterCb";
                expect(cycleCount).toEqual(1);
            },
            withdrawalScheduler: new SchedulerMock({
                startCb: notCalled,
                stopCb: notCalled,
                getTaskCb: () => {
                    return {
                        start: notCalled,
                        cronSchedule: "dummy"
                    };
                }
            })
        });

        await service.run(<TaskServiceParams> {});
        expect(callTracker).toEqual("cycleCounterCb");
    });


    it("should stop when maximum cycles reached", async () => {
        let callTracker = "";
        const service = new CycleCounterCheckService({
            numberOfBuys: 1,
            getCycleCounter: () => 0,
            cycleCounterCb: (cycleCount) => {
                expect(cycleCount).toEqual(1);
            },
            withdrawalScheduler: new SchedulerMock({
                startCb: notCalled,
                stopCb: () => {
                    callTracker += "stopCb ";
                },
                getTaskCb: () => {
                    return {
                        start: async () => {
                            callTracker += "getTaskCbStart";
                        },
                        cronSchedule: "dummy"
                    };
                }
            })
        });

        await service.run(<TaskServiceParams> {
            schedule: {
                stop: () => {
                    callTracker += "scheduleStop ";
                }
            }
        });
        expect(callTracker).toEqual("scheduleStop stopCb getTaskCbStart");
    });


    it("should ignore the cycle counter", async () => {
        const service = new CycleCounterCheckService({
            numberOfBuys: 0,
            getCycleCounter: () => 0,
            cycleCounterCb: notCalled,
            withdrawalScheduler: new SchedulerMock({
                startCb: notCalled,
                stopCb: notCalled,
                getTaskCb: () => {
                    return {
                        start: notCalled,
                        cronSchedule: "dummy"
                    };
                }
            })
        });

        await service.run(<TaskServiceParams> {});
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}

async function notCalled(): Promise<void> {
    fail("should not reach here");
}