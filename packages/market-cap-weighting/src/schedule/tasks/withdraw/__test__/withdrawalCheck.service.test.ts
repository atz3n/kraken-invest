import { config } from "../../../../../test/config";
import { TaskServiceCode, TaskServiceParams } from "../../../taskFactory";
import { WithdrawalCheckService } from "../withdrawalCheck.service";


if (!config.skipTests.includes("withdrawalCheck")) {
    it("should return a continue code when withdrawal is set", async () => {
        const service = new WithdrawalCheckService({
            shouldWithdraw: true
        });

        const code = await service.run(<TaskServiceParams> {});
        expect(code).toEqual(TaskServiceCode.CONTINUE);
    });


    it("should return a stop code when withdrawal is not set", async () => {
        const service = new WithdrawalCheckService({
            shouldWithdraw: false
        });

        const code = await service.run(<TaskServiceParams> {});
        expect(code).toEqual(TaskServiceCode.STOP);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}