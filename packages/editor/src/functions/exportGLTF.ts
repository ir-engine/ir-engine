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

import { Entity } from '@ir-engine/ecs/src/Entity'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { exportGLTFScene } from '@ir-engine/engine/src/gltf/exportGLTFScene'
import { uploadProjectFiles } from './assetFunctions'

export default async function exportGLTF(entity: Entity, path: string) {
  const [, orgname, pName, fileName] = STATIC_ASSET_REGEX.exec(path)!
  return exportRelativeGLTF(entity, `${orgname}/${pName}`, fileName)
}

export async function exportRelativeGLTF(entity: Entity, projectName: string, relativePath: string) {
  const isGLTF = /\.gltf$/.test(relativePath)
  const gltf = exportGLTFScene(entity)
  if (!gltf) return
  const blob = [new Blob([JSON.stringify(gltf, null, 2)])]
  const file = new File(blob, relativePath)
  const urls = await Promise.all(
    uploadProjectFiles(
      projectName,
      [file],
      [``],
      [
        {
          contentType: 'model/gltf+json',
          type: 'asset'
        }
      ]
    ).promises
  )
  console.log('exported model data to ', ...urls)
}
