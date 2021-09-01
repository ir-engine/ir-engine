import { defineQuery, defineSystem, System } from 'bitecs'
import { refreshSceneObjects } from './functions/refreshSceneObjects'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { GeoLabelSetComponent } from './GeoLabelSetComponent'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { sceneToLl } from './MeshBuilder'
import { vector3ToPosition } from './util'

export const MapUpdateSystem = async (): Promise<System> => {
  const mapsQuery = defineQuery([MapComponent])
  const labelsQuery = defineQuery([GeoLabelSetComponent])

  return defineSystem((world: ECSWorld) => {
    for (const mapEntity of mapsQuery(world)) {
      const map = getComponent(mapEntity, MapComponent)

      const viewerPosition = vector3ToPosition(getComponent(map.viewer as number, TransformComponent).position)

      const viewerDistanceFromCenter = Math.hypot(...viewerPosition)
      if (viewerDistanceFromCenter >= map.triggerRefreshRadius) {
        map.center = sceneToLl(viewerPosition, map.center)
        refreshSceneObjects(mapEntity, world)
      }
    }

    // TODO test
    for (const entity of labelsQuery(world)) {
      const labels = getComponent(entity, GeoLabelSetComponent).value
      for (const label of labels) {
        label.onUpdate(Engine.camera)
      }
    }

    return world
  })
}
