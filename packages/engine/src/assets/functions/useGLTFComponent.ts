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

import { useHookstate } from '@hookstate/core'
import {
  Entity,
  EntityTreeComponent,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  entityExists,
  getComponent,
  removeEntity,
  setComponent
} from '@ir-engine/ecs'
import { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'

/**
 *
 * GLTF loader hook for use in React Contexts.
 * Creates an entity with a GLTFComponent as a child of the provided parentEntity param
 * Returns the root entity of the GLTF after the GLTF has completed loading
 *
 * @param url The URL of the GLTF file to load
 * @param parentEntity The entity that is loading the GLTF
 * @returns Entity | null
 */
export function useGLTFComponent(url: string, parentEntity: Entity): Entity | null {
  const gltfEntityState = useHookstate(UndefinedEntity)
  const loaded = GLTFComponent.useSceneLoaded(gltfEntityState.value)

  useEffect(() => {
    if (!url || !parentEntity) return
    const gltfEntity = createEntity()
    setComponent(gltfEntity, EntityTreeComponent, { parentEntity })
    setComponent(gltfEntity, UUIDComponent, {
      entitySourceID: getComponent(parentEntity, UUIDComponent).entitySourceID,
      entityID: UUIDComponent.generate()
    })
    setComponent(gltfEntity, GLTFComponent, { src: url })
    gltfEntityState.set(gltfEntity)

    return () => {
      if (entityExists(gltfEntity)) {
        removeEntity(gltfEntity)
        gltfEntityState.set(UndefinedEntity)
      }
    }
  }, [parentEntity, url])

  return loaded ? gltfEntityState.value : null
}
