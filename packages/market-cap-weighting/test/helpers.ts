// Workaround. Fail function is missing since jest v27 (see: https://github.com/facebook/jest/issues/11698)
export function fail(message = "") {
    let failMessage = "";
    failMessage += "\n";
    failMessage += "FAIL FUNCTION TRIGGERED\n";
    failMessage += "The fail function has been triggered";
    failMessage += message ? " with message:" : "";

    expect(message).toEqual(failMessage);
}