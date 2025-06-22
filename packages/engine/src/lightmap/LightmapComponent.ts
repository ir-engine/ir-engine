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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  createEntity,
  defineComponent,
  EntityTreeComponent,
  EntityUUID,
  getAncestorWithComponents,
  getAuthoringCounterpart,
  getChildrenWithComponents,
  getComponent,
  removeEntity,
  removeEntityNodeRecursively,
  setComponent,
  useComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { Box3, Box3Helper, BufferGeometry, Mesh, Vector3 } from 'three'
import { AssetState } from '../gltf/GLTFState'

declare module 'xatlas-three' {
  export interface UVUnwrapper {
    isLoaded: boolean
  }
}

export const LightmapComponent = defineComponent({
  name: 'LightmapComponent',
  jsonID: 'IR_lightmap',

  schema: S.Object({
    atlasSrc: S.String({ default: '' }),
    lightmapSrc: S.String({ default: '' })
  }),

  reactor: ({ entity }) => {
    const lightmapComponent = useComponent(entity, LightmapComponent)

    //create box3 lightmap volume helper
    useEffect(() => {
      setComponent(entity, BoundingBoxComponent, {
        box: new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5))
      })
      const helperEntity = createEntity()
      const helper = new Box3Helper(getComponent(entity, BoundingBoxComponent).box, 0xff0000)
      helper.name = `lightmap-volume-helper-${entity}`
      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, VisibleComponent)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(helperEntity, ObjectComponent, helper)
      ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.NodeHelper)

      return () => {
        removeEntity(helperEntity)
      }
    }, [])

    useEffect(() => {
      if (!lightmapComponent.atlasSrc.value) return
      AssetState.loadAsync(lightmapComponent.atlasSrc.value, false, UUIDComponent.generate()).then((atlasEntity) => {
        const sceneUUID = UUIDComponent.get(getAncestorWithComponents(entity, [SceneComponent]))
        for (const atlasedChildEntity of getChildrenWithComponents(atlasEntity, [MeshComponent])) {
          const correspondingEntity = UUIDComponent.getEntityByUUID(
            (sceneUUID + getComponent(atlasedChildEntity, UUIDComponent).entityID) as EntityUUID
          )
          const atlasedMeshComponent = getComponent(atlasedChildEntity, MeshComponent)
          if (!correspondingEntity) continue
          const correspondingMesh = new Mesh(new BufferGeometry().copy(atlasedMeshComponent.geometry))

          setComponent(correspondingEntity, MeshComponent, correspondingMesh)
          const authoringCounterpart = getAuthoringCounterpart(correspondingEntity)
          if (authoringCounterpart) {
            setComponent(
              authoringCounterpart,
              MeshComponent,
              new Mesh(new BufferGeometry().copy(atlasedMeshComponent.geometry))
            )
          }
        }
        removeEntityNodeRecursively(atlasEntity)
      })
    }, [lightmapComponent.atlasSrc])

    return null
  }
})
