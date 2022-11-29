module.exports = {
    testEnvironment: "node",
    roots: [
        "<rootDir>/test"
    ],
    transform: {
        "^.+\\.ts?$": "ts-jest"
    },
    setupFilesAfterEnv: [
        "./test/setup.ts"
    ],
    verbose: true
};