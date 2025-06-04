/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import type { StorybookConfig } from '@storybook/react-vite'
import globby from 'globby'
import { dirname, join, resolve } from 'path'
import { mergeConfig } from 'vite'

const stories = globby.sync(['../src/**/*.stories.tsx', '../../client-core/src/components/Settings/*.stories.tsx'], {
  ignore: [
    '../src/primitives/tailwind/TruncatedText/**/*.stories.tsx',
    '../src/components/tailwind/Header/**/*.stories.tsx',
    '../src/pages/Capture/index.stories.tsx',
    '../src/components/editor/ComponentDropdown/index.stories.tsx',
    '../src/primitives/tailwind/AvatarImage/*.stories.tsx',
    '../src/components/editor/input/Folder/index.stories.tsx',
    '../src/components/editor/input/FileBrowser/index.stories.tsx',
    '../src/components/editor/input/Model/*.stories.tsx',
    '../src/components/editor/input/Prefab/*.stories.tsx',
    '../src/components/editor/input/Texture/*.stories.tsx',
    '../src/components/editor/properties/animation/*.stories.tsx',
    '../src/components/editor/properties/envMapBake/**/*.stories.tsx',
    '../src/components/editor/properties/envmap/*.stories.tsx',
    '../src/components/editor/properties/gallery/*.stories.tsx',
    '../src/components/editor/properties/image/**/*.stories.tsx',
    '../src/components/editor/properties/imageGrid/*.stories.tsx',
    '../src/components/editor/properties/particle/*.stories.tsx',
    '../src/components/editor/properties/portal/*.stories.tsx',
    '../src/components/editor/properties/reflectionProbe/*.stories.tsx',
    '../src/components/editor/properties/skybox/*.stories.tsx',
    '../src/components/editor/properties/light/**/*.stories.tsx',
    '../src/components/editor/properties/media/*.stories.tsx',
    '../src/components/editor/properties/video/*.stories.tsx',
    '../src/components/editor/properties/xruiPlayback/*.stories.tsx',
    '../src/components/editor/properties/scene/**/*.stories.tsx',
    '../src/components/editor/input/Audio/*.stories.tsx'
  ],
  cwd: resolve(__dirname)
})

const config: StorybookConfig = {
  env: (config) => ({
    ...config,
    ...require('dotenv').config({
      path: '../../.env.local'
    }).parsed
  }),
  typescript: {
    reactDocgen: false
  },
  stories,
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-toolbars'),
    getAbsolutePath('@storybook/manager-api'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-jest'),
    getAbsolutePath('storybook-addon-sass-postcss'),
    'storybook-addon-rmeix-react-router'
  ],
  staticDirs: ['../public', '../../client/public'],
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
