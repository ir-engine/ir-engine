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
const rootDir = path.resolve(__dirname, '../..');

// List of all packages used by Client Native.
const packages = [
  'hyperflux',
  'projects',
  'common',
  'ecs',
  'engine',
  'network',
  'spatial',
  'ui',
  'xrui',
];

const generateAliases = () => {
  // Generate aliases for all packages
  return packages.reduce(
    (aliases, pkg) => ({
      ...aliases,
      [`@ir-engine/${pkg}/*`]: path.resolve(rootDir, `packages/${pkg}/src/*`),
    }),
    {},
  );
};

module.exports = function (api) {
  api.cache(false);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
          alias: generateAliases(),
        },
      ],
      [
        'module:react-native-dotenv',
        {
          envName: '@env',
          moduleName: '@env',
          path: '../../.env.local',
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
    ],
  };
};
