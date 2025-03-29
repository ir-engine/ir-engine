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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

const path = require('path');
const fs = require('fs');
const {makeMetroConfig} = require('@rnx-kit/metro-config');
const {getDefaultConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const {sourceExts} = defaultConfig.resolver;

module.exports = makeMetroConfig({
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('msgpackr')) {
        return {
          filePath: path.resolve(
            __dirname,
            '../../node_modules/msgpackr/dist/index.js',
          ),
          type: 'sourceFile',
        };
      }
      if (moduleName.startsWith('draco3dgltf')) {
        return {
          filePath: path.resolve(
            __dirname,
            '../../node_modules/@callstack/react-native-draco/lib/commonjs/index.js',
          ),
          type: 'sourceFile',
        };
      }
      if (moduleName === 'crypto') {
        return context.resolveRequest(
          context,
          'react-native-quick-crypto',
          platform,
        );
      }
      if (
        moduleName.startsWith('@ir-engine/editor') ||
        moduleName.startsWith('@ir-engine/visual-script')
      ) {
        return {
          filePath: path.resolve(__dirname, `./emptyPolyfill.js`),
          type: 'sourceFile',
        };
      }
      if (
        moduleName.endsWith('.css') ||
        moduleName.endsWith('.scss') ||
        moduleName.endsWith('.sass') ||
        moduleName.endsWith('scss?inline') ||
        moduleName.endsWith('svg?react')
      ) {
        return {
          filePath: path.resolve(__dirname, './emptyPolyfill.js'),
          type: 'sourceFile',
        };
      }
      if (moduleName.endsWith('.wasm')) {
        const cleanName = path.basename(moduleName, '.wasm');
        const callerDir = path.normalize(
          path.dirname(context.originModulePath),
        );

        const mockModulePath = path.resolve(
          __dirname,
          './wasm/_generated/modules/' + cleanName + '.js',
        );

        console.log(mockModulePath);

        if (!fs.existsSync(mockModulePath)) {
          throw new Error(
            `Attempting to import unknown WASM module '${moduleName}' from ${context.originModulePath}.\n Did you forget to run \`polygen generate\`?`,
          );
        }

        return {type: 'sourceFile', filePath: mockModulePath};
      }
      return context.resolveRequest(context, moduleName, platform);
    },
    sourceExts: [
      ...sourceExts,
      'scss',
      'sass',
      'css',
      'scss?inline',
      'svg?react',
    ],
  },
  watchFolders: [path.resolve(__dirname, '../..')],
});
