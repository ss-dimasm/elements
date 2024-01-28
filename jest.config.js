const { join } = require('path')
const { defaults } = require('jest-config')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/src/tests/'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '<rootDir>/src/**/*.tsx'],
  setupFiles: [join(__dirname, './jest-setup')],
  coverageDirectory: './src/tests/coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>[/\\\\](node_modules|src/types|src/tests|src/contexts|src/scripts|src/storybook|src/styles|src/hooks)[/\\\\]',
    '.stories.tsx',
    'src/index.tsx',
    'index.ts',
    'src/styles',
  ],
  modulePathIgnorePatterns: ['<rootDir>[/\\\\](node_modules|public|dist)[/\\\\]'],
  moduleNameMapper: {
    '^.+\\.svg$': join(__dirname, './svg-transform.js'),
    '@/(.*)': '<rootDir>/src/$1',
    '^.+.(?=.*scss|sass|css|png|jpg|pdf|jpeg).*': join(__dirname, './css-stub.js'),
    '\\.(css)$': '<rootDir>/src/scripts/style-mock.js',
  },
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx', 'graphql', 'gql', 'mjs'],
  globalSetup: join(__dirname, './jest-global.js'),
  resolver: join(__dirname, './resolver.js'),
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  verbose: false,
  coverageReporters: ['json-summary', 'text', 'lcov'],
}
