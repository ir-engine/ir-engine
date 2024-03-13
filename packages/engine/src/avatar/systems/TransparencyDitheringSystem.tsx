import { Entity, defineQuery, defineSystem, getComponent, useQuery } from '@etherealengine/ecs'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { useHookstate } from '@etherealengine/hyperflux'
import React from 'react'
import { SceneComponent } from '../../scene/components/SceneComponent'
import { useModelSceneID } from '../../scene/functions/loaders/ModelFunctions'
import { TransparencyDitheringComponent } from '../components/TransparencyDitheringComponent'

const TransparencyDitheringQuery = defineQuery([TransparencyDitheringComponent[0]])
const execute = () => {
  for (const entity of TransparencyDitheringQuery()) {
    const ditherComponent = getComponent(entity, TransparencyDitheringComponent[0])
  }
}
const reactor = () => {
  const entities = useQuery([TransparencyDitheringComponent[0]])
  // const ids = useHookstate(entities.map((entity) => getModelSceneID(entity)))
  // const entitiesInScenes = useHookstate(ids.map((id) => SceneComponent.entitiesByScene[id.value]))
  // console.log(entitiesInScenes.value)
  // console.log(ids.value)
  return (
    <>
      {entities.map((entity) => (
        <DitherReactor key={entity} entity={entity} />
      ))}
    </>
  )
}

const DitherReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const sceneInstanceID = useModelSceneID(entity)
  const childEntities = useHookstate(SceneComponent.entitiesBySceneState[sceneInstanceID])

  return null
}

export const TransparencyDitheringSystem = defineSystem({
  uuid: 'TransparencyDitheringSystem',
  insert: { with: PresentationSystemGroup },
  execute,
  reactor
})
