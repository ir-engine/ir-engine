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
  defineComponent,
  EntityUUID,
  getAncestorWithComponents,
  getAuthoringCounterpart,
  getChildrenWithComponents,
  getComponent,
  getOptionalComponent,
  removeEntityNodeRecursively,
  setComponent,
  useAncestorWithComponents,
  useComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { Box3, Vector3 } from 'three'
import { useTexture } from '../assets/functions/resourceLoaderHooks'
import { GLTFComponent } from '../gltf/GLTFComponent'
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
    const [lightmapTexture] = useTexture(lightmapComponent.lightmapSrc.value, entity)

    useEffect(() => {
      setComponent(entity, BoundingBoxComponent, {
        box: new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5))
      })
    }, [])

    const sceneEntity = useAncestorWithComponents(entity, [SceneComponent])
    const sceneLoaded = useComponent(getAuthoringCounterpart(sceneEntity) ?? sceneEntity, GLTFComponent).progress

    console.log(sceneLoaded.value)

    useEffect(() => {
      if (!lightmapComponent.atlasSrc.value || sceneLoaded.value !== 100) return

      AssetState.loadAsync(lightmapComponent.atlasSrc.value, false, UUIDComponent.generate()).then((atlasEntity) => {
        const sceneUUID = UUIDComponent.get(getAncestorWithComponents(entity, [SceneComponent]))
        for (const atlasedChildEntity of getChildrenWithComponents(atlasEntity, [MeshComponent])) {
          const correspondingEntity = UUIDComponent.getEntityByUUID(
            (sceneUUID + getComponent(atlasedChildEntity, UUIDComponent).entityID) as EntityUUID
          )
          const atlasedMeshComponent = getComponent(atlasedChildEntity, MeshComponent)
          if (!correspondingEntity) continue
          const correspondingMeshComponent = getOptionalComponent(correspondingEntity, MeshComponent)

          if (!correspondingMeshComponent) continue
          for (let i = 0; i < 3; i++) {
            let attribute = 'uv'
            if (i > 0) attribute += i
            if (atlasedMeshComponent.geometry.hasAttribute(attribute))
              correspondingMeshComponent.geometry.setAttribute(
                attribute,
                atlasedMeshComponent.geometry.getAttribute(attribute)
              )
          }

          correspondingMeshComponent.geometry.setAttribute(
            'position',
            atlasedMeshComponent.geometry.getAttribute('position')
          )
          correspondingMeshComponent.geometry.setAttribute(
            'normal',
            atlasedMeshComponent.geometry.getAttribute('normal')
          )
          correspondingMeshComponent.geometry.index = atlasedMeshComponent.geometry.index
        }
        removeEntityNodeRecursively(atlasEntity)
      })
    }, [lightmapTexture, sceneLoaded])

    return null
  }
})
