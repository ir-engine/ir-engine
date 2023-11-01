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

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '../../ecs/functions/EntityTree'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { LocalTransformComponent } from '../../transform/components/TransformComponent'
import createGLTFExporter from './createGLTFExporter'

function composeScene(entity: Entity) {
  iterateEntityNode(entity, (child) => {
    if (child === entity) return
    const entityTree = getComponent(child, EntityTreeComponent)
    const parent = entityTree.parentEntity
    if (!parent) {
      console.error('invalid model state: missing parent entity')
      return
    }
    const parentObject = getComponent(parent, GroupComponent)[0]
    const object = getComponent(child, GroupComponent)[0]
    const localTransform = getComponent(child, LocalTransformComponent)
    parentObject.add(object)
    object.matrix.copy(localTransform.matrix)
  })
}

function decomposeScene(entity: Entity) {
  iterateEntityNode(entity, (child) => {
    if (child === entity) return
    const object = getComponent(child, GroupComponent)[0]
    Engine.instance.scene.add(object)
  })
}

export default async function exportModelGLTF(
  entity: Entity,
  options = {
    path: '',
    binary: true,
    includeCustomExtensions: true,
    embedImages: true
  }
) {
  composeScene(entity)
  const scene = getComponent(entity, ModelComponent).scene!
  const exporter = createGLTFExporter()
  const modelName = options.path.split('/').at(-1)!.split('.').at(0)!
  const resourceURI = `model-resources/${modelName}`
  const gltf: ArrayBuffer = await new Promise((resolve) => {
    exporter.parse(
      scene,
      (gltf: ArrayBuffer) => {
        decomposeScene(entity)
        resolve(gltf)
      },
      (error) => {
        decomposeScene(entity)
        throw error
      },
      {
        ...options,
        animations: scene.animations ?? [],
        flipY: scene.userData.src.endsWith('.usdz'),
        resourceURI
      }
    )
  })
  return gltf
}
