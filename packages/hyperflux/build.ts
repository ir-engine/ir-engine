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

import { exec } from 'child_process'
import fs from 'fs'
import { join } from 'path'

const build = async () => {
  // clear dist if it exists
  if (fs.existsSync('dist')) fs.rmdirSync('dist', { recursive: true })

  // run tsc --build tsconfig.build.json
  await new Promise<void>((resolve, reject) => {
    exec('tsc --build tsconfig.build.json', (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })

  // remove tsconfig.build.tsbuildinfo
  if (fs.existsSync('dist/tsconfig.build.tsbuildinfo')) {
    fs.unlinkSync('dist/tsconfig.build.tsbuildinfo')
  }

  // copy LICENSE, readme.md, and package.build.json to dist
  fs.copyFileSync('LICENSE', join('dist', 'LICENSE'))
  fs.copyFileSync('readme.md', join('dist', 'readme.md'))
  fs.copyFileSync('package.build.json', join('dist', 'package.json'))
}
build()
