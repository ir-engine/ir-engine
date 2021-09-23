module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json'],
  testEnvironment: 'node',
  moduleDirectories: ["node_modules", "src"],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  setupFilesAfterEnv: [
      './tests/setup.js'
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  passWithNoTests: true,
  testMatch: ['<rootDir>/src/**/*.tests.js',
   '<rootDir>/src/**/*.tests.jsx',
  ]
};