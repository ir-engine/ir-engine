import {
  Entity,
  PresentationSystemGroup,
  QueryReactor,
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
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import React, { useEffect } from 'react'
import { SourceComponent } from '../components/SourceComponent'

/**
 * For p2p networking, entities need to be spawned deterministically for the scene to be consistent across peers, since there is no host.
 * @todo we may replace ScenePeer with the InstanceID/NetworkID
 */
const SourcedEntityReactor = (props: { entity: Entity }) => {
  const parentEntity = useComponent(props.entity, EntityTreeComponent).parentEntity.value
  const parentUUID = useComponent(parentEntity, UUIDComponent).value

  useEffect(() => {
    const entityUUID = getComponent(props.entity, UUIDComponent)
    dispatchAction(
      WorldNetworkAction.spawnEntity({
        ownerID: SceneUser,
        entityUUID,
        parentUUID,
        $network: undefined,
        $topic: undefined,
        $peer: ScenePeer
      })
    )
    return () => {
      dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID }))
    }
  }, [])

  useEffect(() => {
    const entityUUID = getComponent(props.entity, UUIDComponent)
    dispatchAction(
      WorldNetworkAction.spawnEntity({
        ownerID: SceneUser,
        entityUUID,
        parentUUID,
        $network: undefined,
        $topic: undefined,
        $peer: ScenePeer
      })
    )
  }, [parentUUID])

  return null
}

const filterSpatialEntities = (entity: Entity) => hasComponent(entity, EntityTreeComponent)

const SourcedSceneReactor = () => {
  const entity = useEntityContext()
  const source = useComponent(entity, SourceComponent)
  const sourcedEntities = useHookstate(SourceComponent.entitiesBySourceState[source.value]).value

  return (
    <>
      {sourcedEntities.filter(filterSpatialEntities).map((sourcedEntity) => (
        <SourcedEntityReactor key={sourcedEntity} entity={sourcedEntity} />
      ))}
    </>
  )
}

const reactor = () => {
  const ready = useHookstate(NetworkState.worldNetworkState).value?.ready

  if (!ready) return null

  return <QueryReactor ChildEntityReactor={SourcedSceneReactor} Components={[SourceComponent, SceneComponent]} />
}

export const SceneNetworkSystem = defineSystem({
  uuid: 'ir.engine.scene.SceneNetworkSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
