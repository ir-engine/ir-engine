import { dirname, join } from 'path'
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

import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'

const host = process.env['VITE_APP_HOST']

const config: StorybookConfig = {
  env: (config) => ({
    ...config,
    ...require('dotenv').config({
      path: '../../.env.local'
    }).parsed
  }),
  stories: ['../src/primitives/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-toolbars'),
    getAbsolutePath('@storybook/manager-api'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-jest'),
    getAbsolutePath('storybook-addon-react-router-v6'),
    getAbsolutePath('storybook-addon-sass-postcss')
  ],
  core: {},
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {}
  },
  async viteFinal(config, options) {
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
      build: {
        cssMinify: false
      },
      // server: {
      //   ...userConfig?.server,
      //   proxy: {
      //     ...userConfig?.server?.proxy,
      //     cors: false,
      //     '^3030': {
      //       target: `https://${host}:3030`,
      //       changeOrigin: true,
      //       secure: false,
      //       ws: true
      //     },
      //     '^3031': {
      //       target: `https://${host}:3031`,
      //       changeOrigin: true,
      //       secure: false,
      //       ws: true
      //     },
      //     '/sfx': {
      //       target: `https://${host}:3000`,
      //       changeOrigin: true,
      //       secure: false,
      //       // replace port 6006 with 3000
      //       pathRewrite: { '^6006': '3000' }
      //     },
      //     '/fonts': {
      //       target: `https://${host}:3000`,
      //       changeOrigin: true,
      //       secure: false,
      //       // replace port 6006 with 3000
      //       pathRewrite: { '^6006': '3000' }
      //     }
      //   }
      // },
      plugins: []
    })
  },
  docs: {
    autodocs: false
  }
}

export default config

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
