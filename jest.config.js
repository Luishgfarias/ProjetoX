module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/mocks/styleMock.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  watchman: false,
};
