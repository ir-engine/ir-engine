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

import {
  Entity,
  EntityTreeComponent,
  PresentationSystemGroup,
  QueryReactor,
  QuerySubReactor,
  UUIDComponent,
  defineSystem,
  getComponent,
  hasComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { dispatchAction, useHookstate } from '@ir-engine/hyperflux'
import { NetworkState, ScenePeer, SceneUser, WorldNetworkAction } from '@ir-engine/network'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import React, { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { SourceComponent } from '../components/SourceComponent'

/**
 * For p2p networking, entities need to be spawned deterministically for the scene to be consistent across peers, since there is no host.
 * @todo we may replace ScenePeer with the InstanceID/NetworkID
 */
const SourcedEntityReactor = () => {
  const entity = useEntityContext()
  const parentEntity = useComponent(entity, EntityTreeComponent).parentEntity.value
  const parentUUID = useComponent(parentEntity, UUIDComponent).value

  useEffect(() => {
    const entityUUID = getComponent(entity, UUIDComponent)
    return () => {
      dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID }))
    }
  }, [])

  useEffect(() => {
    const entityUUID = getComponent(entity, UUIDComponent)
    dispatchAction(
      WorldNetworkAction.spawnEntity({
        ownerID: SceneUser,
        entityUUID,
        parentUUID,
        $network: undefined,
        $topic: undefined,
        $user: SceneUser,
        $peer: ScenePeer
      })
    )
  }, [parentUUID])

  return null
}

const filterSpatialEntities = (entity: Entity) => hasComponent(entity, EntityTreeComponent)

const SourcedSceneReactor = () => {
  const entity = useEntityContext()
  const sourceID = useComponent(entity, SourceComponent).value
  const sourcedEntities = SourceComponent.useEntitiesBySource(sourceID)

  return (
    <>
      {sourcedEntities.filter(filterSpatialEntities).map((sourcedEntity) => (
        <QuerySubReactor key={sourcedEntity} entity={sourcedEntity} ChildEntityReactor={SourcedEntityReactor} />
      ))}
    </>
  )
}

const SceneReactor = () => {
  const entity = useEntityContext()
  const source = GLTFComponent.useInstanceID(entity)
  const sourcedEntities = SourceComponent.useEntitiesBySource(source)

  return (
    <>
      {sourcedEntities.map((sourcedEntity) => (
        <QuerySubReactor key={sourcedEntity} entity={sourcedEntity} ChildEntityReactor={SourcedSceneReactor} />
      ))}
    </>
  )
}

const reactor = () => {
  const ready = useHookstate(NetworkState.worldNetworkState).value?.ready

  if (!ready) return null

  return <QueryReactor ChildEntityReactor={SceneReactor} Components={[SceneComponent, GLTFComponent]} />
}

export const SceneNetworkSystem = defineSystem({
  uuid: 'ir.engine.scene.SceneNetworkSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
