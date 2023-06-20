/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { loadConfigFromFile, mergeConfig } from 'vite'

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
