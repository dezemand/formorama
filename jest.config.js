module.exports = {
  roots: [ "<rootDir>/src" ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.jest.json",
    },
  },
  transformIgnorePatterns: [ "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$" ],
  moduleFileExtensions: [ "ts", "tsx", "js" ],
};
