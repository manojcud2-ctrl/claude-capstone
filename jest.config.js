module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/node_modules/**',
  ],
  testMatch: [
    '**/test/**/*.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  verbose: true,
};
