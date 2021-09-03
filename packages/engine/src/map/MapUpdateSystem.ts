import { defineQuery, defineSystem, System } from 'bitecs'
import refreshSceneObjects from './functions/refreshSceneObjects'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { GeoLabelSetComponent } from './GeoLabelSetComponent'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { sceneToLl } from './MeshBuilder'
import { vector3ToPosition } from './util'
import { Vector3 } from 'three'

const $vector3 = new Vector3()

export const MapUpdateSystem = async (): Promise<System> => {
  const mapsQuery = defineQuery([MapComponent])
  const labelsQuery = defineQuery([GeoLabelSetComponent])

  return defineSystem((world: ECSWorld) => {
    for (const mapEntity of mapsQuery(world)) {
      const map = getComponent(mapEntity, MapComponent)
      const mapTransform = getComponent(mapEntity, TransformComponent, false, world)
      const viewerTransform = getComponent(map.viewer as number, TransformComponent)
      $vector3.subVectors(viewerTransform.position, mapTransform.position)
      const viewerRelativePosition = vector3ToPosition($vector3)

      const viewerDistanceFromCenter = Math.hypot(...viewerRelativePosition)

      if (viewerDistanceFromCenter >= map.triggerRefreshRadius && !map.refreshInProgress) {
        map.center = sceneToLl(viewerRelativePosition, map.center)
        map.refreshInProgress = true
        refreshSceneObjects(mapEntity, world).then(() => {
          map.refreshInProgress = false
        })
      }
    }

    // TODO use UpdatableComponent
    for (const entity of labelsQuery(world)) {
      const labels = getComponent(entity, GeoLabelSetComponent).value
      for (const label of labels) {
        label.onUpdate(Engine.camera)
      }
    }

    return world
  })
}
