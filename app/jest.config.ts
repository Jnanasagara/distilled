import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        module: "commonjs",
        esModuleInterop: true,
        moduleResolution: "node",
        strict: false,
        allowJs: true,
      },
    }],
  },
  testTimeout: 15000,
  verbose: true,
};

export default config;
