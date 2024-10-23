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

import { getComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { ModelComponent } from '../../scene/components/ModelComponent'
import createGLTFExporter from './createGLTFExporter'

export default async function exportModelGLTF(
  entity: Entity,
  options = {
    projectName: '',
    relativePath: '',
    binary: true,
    includeCustomExtensions: true,
    embedImages: true,
    onlyVisible: false
  }
) {
  const scene = getOptionalComponent(entity, ModelComponent)?.scene ?? getComponent(entity, GroupComponent)[0]
  const exporter = createGLTFExporter()
  const modelName = options.relativePath.split('/').at(-1)!.split('.').at(0)!
  const resourceURI = `model-resources/${modelName}`
  const gltf: ArrayBuffer = await new Promise((resolve) => {
    exporter.parse(
      scene,
      (gltf: ArrayBuffer) => {
        resolve(gltf)
      },
      (error) => {
        throw error
      },
      {
        ...options,
        animations: scene.animations ?? [],
        flipY: !!scene.userData.src?.endsWith('.usdz'),
        resourceURI,
        srcEntity: entity
      }
    )
  })
  return gltf
}
