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

import { transform } from '@svgr/core'
import fs from 'fs/promises'
import iconaJson from '../icona.json'

function transformName(name: string) {
  const parts = name.split(/[^A-Za-z]/gi)
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

async function run() {
  const dirExists = await fs
    .opendir('./src/icons/files')
    .then((dir) => {
      const result = !!dir.readSync()
      dir.closeSync()
      return result
    })
    .catch(() => false)

  if (dirExists) {
    console.log('icons/files already exists, deleting old directory and creating new one')
    await fs.rm('./src/icons/files', { recursive: true })
    await fs.mkdir('./src/icons/files')
  } else {
    await fs.mkdir('./src/icons/files')
    console.log('created icons/files')
  }

  const transformPromises = Object.values(iconaJson).map(async (iconEntry) => {
    const componentName = transformName(iconEntry.name)
    const reactComponent = await transform(
      iconEntry.svg,
      {
        icon: true,
        dimensions: true,
        typescript: true,
        ref: true,
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx']
      },
      { componentName }
    )
    await fs.writeFile('./src/icons/files/' + componentName + '.tsx', reactComponent)

    return componentName
  })

  const componentNames = await Promise.all(transformPromises)

  const componentNamesExports = componentNames
    .toSorted()
    .map((componentName) => `export { default as ${componentName} } from './files/${componentName}'`)
    .join('\n')
  await fs.writeFile('./src/icons/index.ts', componentNamesExports)

  console.log(`completed writing ${transformPromises.length} files and generated index.ts`)
}

run()
