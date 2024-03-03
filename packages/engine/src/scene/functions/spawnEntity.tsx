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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { PresentationSystemGroup, createEntity, defineSystem, setComponent } from '@etherealengine/ecs'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  none,
  useHookstate
} from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { WorldNetworkAction } from '@etherealengine/spatial/src/networking/functions/WorldNetworkAction'
import React, { useEffect } from 'react'
import { MathUtils, Quaternion, Vector3 } from 'three'
import matches, { Validator } from 'ts-matches'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { ModelComponent } from '../components/ModelComponent'

type SpawnEntityOptions = {
  name: string
  uuid?: EntityUUID
  parent?: EntityUUID
  position?: Vector3
  rotation?: Quaternion
  gltf?: string | GLTF
}

export class MeshNetworkActions {
  static spawnMesh = defineAction(
    WorldNetworkAction.spawnObject.extend({
      type: 'ee.engine.world.SPAWN_MESH',
      name: matches.string,
      gltf: matches.string.orParser(matches.object as Validator<unknown, GLTF>).optional()
    })
  )
}

export const MeshNetworkState = defineState({
  name: 'ee.engine.mesh.MeshNetworkState',

  initial: {} as Record<EntityUUID, SpawnEntityOptions>,

  receptors: {
    onSpawn: MeshNetworkActions.spawnMesh.receive((action) => {
      getMutableState(MeshNetworkState)[action.entityUUID].set({
        name: action.name,
        uuid: action.entityUUID,
        position: action.position ?? undefined, // todo, why does tsmatches make this null?
        rotation: action.rotation ?? undefined,
        gltf: action.gltf ?? undefined
      })
    }),
    onDestroyObject: WorldNetworkAction.destroyObject.receive((action) => {
      getMutableState(MeshNetworkState)[action.entityUUID].set(none)
    })
  },

  spawnEntity(options: SpawnEntityOptions) {
    const entity = createEntity()

    setComponent(entity, UUIDComponent, options.uuid)
    setComponent(entity, NameComponent, options.name)

    setComponent(entity, TransformComponent, {
      position: options.position,
      rotation: options.rotation
    })

    dispatchAction(
      MeshNetworkActions.spawnMesh({
        name: options.name,
        entityUUID: options.uuid ?? (MathUtils.generateUUID() as EntityUUID),
        position: options.position,
        rotation: options.rotation,
        gltf: options.gltf,
        parentUUID: options.parent
      })
    )

    return entity
  }
})

const MeshReactor = ({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(MeshNetworkState)[entityUUID])
  const entity = UUIDComponent.useEntityByUUID(entityUUID)

  useEffect(() => {
    if (!entity) return

    setComponent(entity, NameComponent, state.name.value)
    if (state.gltf.value) {
      if (typeof state.gltf.value === 'string') {
        setComponent(entity, ModelComponent, { src: state.gltf.value })
      } else {
        const blob = new Blob([JSON.stringify(state.gltf.value)], { type: 'model/gltf+json' })
        const src = URL.createObjectURL(blob)
        setComponent(entity, ModelComponent, { src })
      }
    }
  }, [entity])

  return null
}

export const MeshStateReactor = () => {
  const avatarState = useHookstate(getMutableState(MeshNetworkState))
  return (
    <>
      {avatarState.keys.map((entityUUID: EntityUUID) => (
        <MeshReactor key={entityUUID} entityUUID={entityUUID} />
      ))}
    </>
  )
}

export const MeshNetworkSystem = defineSystem({
  uuid: 'ee.engine.avatar.MeshNetworkSystem',
  insert: { after: PresentationSystemGroup },
  reactor: MeshStateReactor
})
