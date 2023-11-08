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

import { useEffect } from 'react'
import { Mesh } from 'three'
import { convertToBatchedMesh } from '../../assets/classes/BatchedMesh'
import { defineComponent, getComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { iterateEntityNode } from '../../ecs/functions/EntityTree'
import iterateObject3D from '../util/iterateObject3D'
import { GroupComponent, addObjectToGroup } from './GroupComponent'

export const BatchedMeshComponent = defineComponent({
  name: 'BatchedMeshComponent',
  jsonID: 'batched-mesh',
  onInit: (entity) => ({
    active: false
  }),
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.active === 'boolean') component.active.set(json.active)
  },
  toJSON: (entity, component) => ({
    active: component.active.value
  }),
  reactor: () => {
    const entity = useEntityContext()
    const batchedMeshComponent = useComponent(entity, BatchedMeshComponent)

    useEffect(() => {
      if (batchedMeshComponent.active.value) {
        //iterate children of this entity and add them to the batch
        const meshes: Mesh[] = iterateEntityNode(
          entity,
          (childEntity) => {
            const scene = getComponent(childEntity, GroupComponent)[0]!
            return iterateObject3D(
              scene,
              (object) => object as Mesh,
              (object) => (object as Mesh).isMesh,
              false,
              false
            )
          },
          (childEntity) => {
            if (!hasComponent(childEntity, GroupComponent)) return false
            if (getComponent(childEntity, GroupComponent).length === 0) return false
            return true
          },
          false
        ).flat()
        //create batched mesh from these meshes
        const batchedMesh = new Mesh()
        const result = convertToBatchedMesh(meshes)
        //add batched mesh to this entity's GroupComponent to be rendered
        addObjectToGroup(entity, result)
      }
    }, [batchedMeshComponent.active])

    return null
  }
})
