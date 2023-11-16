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

import exportModelGLTF from '@etherealengine/engine/src/assets/functions/exportModelGLTF'
import { pathResolver } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'

import { uploadProjectFiles } from './assetFunctions'

export default async function exportGLTF(entity: Entity, path: string) {
  const isGLTF = /\.gltf$/.test(path)
  const gltf = await exportModelGLTF(entity, {
    path,
    binary: !isGLTF,
    embedImages: !isGLTF,
    includeCustomExtensions: true
  })

  const [, pName, fileName] = pathResolver().exec(path)!
  const blob = isGLTF ? [JSON.stringify(gltf)] : [gltf]
  const file = new File(blob, fileName)
  const urls = await Promise.all(uploadProjectFiles(pName, [file]).promises)
  console.log('exported model data to ', ...urls)
}
