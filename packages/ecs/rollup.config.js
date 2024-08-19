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


import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import typescript from '@rollup/plugin-typescript'

// import fs from 'fs'
// import {resolve} from 'path'

// const __dirname = import.meta.dirname;
// fs.readdir(resolve(__dirname, 'src'), (err, files) => {
//   files && files.forEach(file => {
//     console.log(file);
//   });
// });

const productionConfig = {
  minifyInternalExports: true,
}
function customBuild() {
  return esbuild({minify: true})
}

const inputFile = `src/index.ts`
const packageName = "ecs"

export default [
  {
    input: inputFile,
    plugins: [typescript({exclude: ["**/*.test.ts"]}), customBuild()],
    output: [
      {
        file: `dist/${packageName}.js`,
        format: 'es',
        ...productionConfig
      },
    ]
  },
  {
    input: inputFile,
    plugins: [typescript({exclude: ["**/*.test.ts"]}), customBuild()],
    output: [
      {
        file: `dist/${packageName}.cjs`,
        format: 'cjs',
        ...productionConfig
      },
    ]
  },
  {
    input: inputFile,
    plugins: [dts({compilerOptions: {exclude: ["**/*.test.ts"]}})],
    output: {
      file: `dist/${packageName}.d.ts`,
    },
  },
]
