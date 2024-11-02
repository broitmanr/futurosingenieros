module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 60000,
  // collectCoverage: true,
  // coverageDirectory: 'coverage',
  // coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/testSetup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports',
      outputName: 'junit.xml'
    }],
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: 'reports/test-report.html'
    }]
  ]
}
