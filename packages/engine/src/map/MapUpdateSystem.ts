import { defineQuery, System } from 'bitecs'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { fromMetersFromCenter } from './units'
import { multiplyArray, vector3ToArray2 } from './util'
import { Object3D, Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { World } from '../ecs/classes/World'
import startAvailableTasks from './functions/startAvailableTasks'
import { createProductionPhases } from './functions/createProductionPhases'
import computeDistanceFromCircle from './functions/computeDistanceFromCircle'

const $vector3 = new Vector3()

/** Track where the viewer was the last time we kicked off a new set of map contruction tasks */
const $previousViewerPosition = new Vector3()

export default async function MapUpdateSystem(world: World): Promise<System> {
  const mapsQuery = defineQuery([MapComponent])
  const viewerQuery = defineQuery([FollowCameraComponent])
  let previousViewerEntity: Entity

  return () => {
    const viewerEntity = viewerQuery(world)[0]
    const mapEntities = mapsQuery(world)
    const mapEntity = mapEntities[0]
    // Sanity checks
    if (!mapEntity || !viewerEntity) return
    if (mapEntities.length > 1) console.warn('Not supported: More than one map!')
    const mapComponent = getComponent(mapEntity, MapComponent, false, world)
    const mapScale = getComponent(mapEntity, TransformComponent, false, world).scale.x
    const object3dComponent = getComponent(mapEntity, Object3DComponent, false, world)
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)

    // Initialize on first pass or whenever the viewer changes
    if (viewerEntity !== previousViewerEntity) {
      $previousViewerPosition.copy(viewerTransform.position)
    }

    // Find how far the viewer has travelled since last update, in real-world scale (scale=1)
    $vector3.subVectors(viewerTransform.position, $previousViewerPosition).divideScalar(mapScale)
    const viewerPositionDeltaNormalScale = vector3ToArray2($vector3)
    const viewerDistanceFromCenter = Math.hypot(...viewerPositionDeltaNormalScale)

    if (viewerDistanceFromCenter >= mapComponent.triggerRefreshRadius) {
      mapComponent.center = fromMetersFromCenter(viewerPositionDeltaNormalScale, mapComponent.center)
      const phases = createProductionPhases(
        mapComponent.fetchTilesTasks,
        mapComponent.tileCache,
        mapComponent.extractTilesTasks,
        mapComponent.featureCache,
        mapComponent.geometryTasks,
        mapComponent.geometryCache,
        mapComponent.completeObjectsTasks,
        mapComponent.completeObjects,
        mapComponent.center,
        mapComponent.originalCenter,
        mapComponent.minimumSceneRadius,
        viewerTransform.position,
        mapScale
      )
      startAvailableTasks(phases)

      $previousViewerPosition.copy(viewerTransform.position)
      $previousViewerPosition.y = 0
    }

    // This could be implemented as yet another phase
    const subSceneChildren = []
    for (const object of mapComponent.completeObjects.values()) {
      const { mesh, centerPoint } = object

      // TODO make a helper function for this, same code in CreateCompleteObjectPhase
      // TODO also use a more efficient distance calc
      const distance = computeDistanceFromCircle(
        multiplyArray(vector3ToArray2(viewerTransform.position), 1 / mapScale),
        object.centerPoint,
        object.boundingCircleRadius
      )
      if (mesh && distance <= mapComponent.minimumSceneRadius) {
        setPosition(mesh, centerPoint)
        object.mesh.parent = object3dComponent.value
        subSceneChildren.push(object.mesh)
      } else {
        object.mesh.parent = null
      }
    }

    object3dComponent.value.children = subSceneChildren

    previousViewerEntity = viewerEntity
    return world
  }
}

function setPosition(object3d: Object3D, centerPoint: [number, number]) {
  object3d.position.set(centerPoint[0], 0, centerPoint[1])
}
