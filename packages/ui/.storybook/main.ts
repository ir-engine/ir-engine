import { mergeConfig } from 'vite'

export default {
  // managerEntries: [require('path').resolve(__dirname, './addons/RegisterAddons')],
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'true'
  },
  env: (config) => ({
    ...config,
    ...require('dotenv').config({
      path: '../../.env.local'
    }).parsed
  }),
  stories: ['./**/*.stories.@(js|jsx|ts|tsx)', '../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-toolbars',
    '@storybook/manager-api',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-jest',
    'storybook-addon-react-router-v6'
  ],
  core: {
    builder: '@storybook/builder-vite'
  },
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  features: {
    storyStoreV7: true
  },
  async viteFinal(config) {
    const userConfig = config
    return mergeConfig(config, {
      ...userConfig,
      define: {
        ...userConfig?.define,
        'process.env': process.env
      },
      resolve: {
        ...userConfig?.resolve,
        alias: {
          ...userConfig?.resolve?.alias,
          path: require.resolve('path-browserify'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          // alias public folder to root
          '@': require('path').resolve(__dirname, '../../client/public')
        }
      },
      server: {
        ...userConfig?.server,
        proxy: {
          ...userConfig?.server?.proxy,
          cors: false,
          // proxy https://travis.shetland-turtle.ts.net:3000 to https://travis.shetland-turtle.ts.net:3030
          '^3030': {
            target: 'https://travis.shetland-turtle.ts.net:3030',
            changeOrigin: true,
            secure: false,
            ws: true
          },
          '^3031': {
            target: 'https://travis.shetland-turtle.ts.net:3031',
            changeOrigin: true,
            secure: false,
            ws: true
          },
          '/sfx': {
            target: 'https://travis.shetland-turtle.ts.net:3000',
            changeOrigin: true,
            secure: false,
            // replace port 6006 with 3000
            pathRewrite: { '^6006': '3000' }
          },
          '/fonts': {
            target: 'https://travis.shetland-turtle.ts.net:3000',
            changeOrigin: true,
            secure: false,
            // replace port 6006 with 3000
            pathRewrite: { '^6006': '3000' }
          }
        }
      },
      plugins: []
    })
  },
  docs: {
    autodocs: false
  }
}
