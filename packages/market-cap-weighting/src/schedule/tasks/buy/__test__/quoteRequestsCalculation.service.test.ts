import { config } from "../../../../../test/config";
import { fail } from "../../../../../test/helpers";
import { TaskServiceParams } from "../../../taskFactory";
import { QuoteRequestsCalculationService } from "../quoteOrderRequestsCalculation.service";


if (!config.skipTests.includes("quoteRequestsCalculation")) {
    it("should calculate the quote requests", async () => {
        let callTracker = "";
        const service = new QuoteRequestsCalculationService({
            quoteInvestingAmount: 100,
            quoteSymbol: "EUR",
            ratios: [
                {
                    baseSymbol: "BTC",
                    cap: 70,
                    coinGeckoId: "Bitcoin",
                    ratio: 0.7
                },
                {
                    baseSymbol: "ETH",
                    cap: 20,
                    coinGeckoId: "Ethereum",
                    ratio: 0.2
                },
                {
                    baseSymbol: "LTC",
                    cap: 10,
                    coinGeckoId: "Litecoin",
                    ratio: 0.1
                }
            ],
            quoteOrderRequestsCb: (quoteOrderRequests) => {
                callTracker += "quoteOrderRequestsCb";
                expect(quoteOrderRequests.length).toEqual(3);

                for (let i = 0 ; i < quoteOrderRequests.length ; i++) {
                    const quoteOrderRequest = quoteOrderRequests[i];
                    if (quoteOrderRequest.baseSymbol === "BTC") {
                        expect(quoteOrderRequest.quoteSymbol).toEqual("EUR");
                        expect(quoteOrderRequest.quoteAmount).toEqual(70);
                        continue;
                    }
                    if (quoteOrderRequest.baseSymbol === "ETH") {
                        expect(quoteOrderRequest.quoteSymbol).toEqual("EUR");
                        expect(quoteOrderRequest.quoteAmount).toEqual(20);
                        continue;
                    }
                    if (quoteOrderRequest.baseSymbol === "LTC") {
                        expect(quoteOrderRequest.quoteSymbol).toEqual("EUR");
                        expect(quoteOrderRequest.quoteAmount).toEqual(10);
                        continue;
                    }
                    fail("should not reach here");
                }
            }
        });

        await service.run(<TaskServiceParams> {});
        expect(callTracker.trim()).toEqual("quoteOrderRequestsCb");
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}