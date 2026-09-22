import baseConfig from '../jest.config.mjs';

export default {
  ...baseConfig,
  rootDir: '..',
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
};
