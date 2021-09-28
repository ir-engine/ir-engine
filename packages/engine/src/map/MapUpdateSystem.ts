import { defineQuery } from 'bitecs'
import { System } from '../ecs/classes/System'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { fromMetersFromCenter } from './functions/UnitConversionFunctions'
import { addChildFast, multiplyArray, setPosition, vector3ToArray2 } from './util'
import { Object3D, Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { World } from '../ecs/classes/World'
import actuateLazy from './functions/actuateLazy'
import getPhases from './functions/getPhases'
import isIntersectCircleCircle from './functions/isIntersectCircleCircle'

const $vector3 = new Vector3()

/** Track where the viewer was the last time we kicked off a new set of map contruction tasks */
const $previousViewerPosition = new Vector3()

export default async function MapUpdateSystem(world: World): Promise<System> {
  const mapsQuery = defineQuery([MapComponent])
  const viewerQuery = defineQuery([FollowCameraComponent])
  let previousViewerEntity: Entity
  let shouldUpdateChildren = true

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
    const viewerPosition = vector3ToArray2(viewerTransform.position)
    const viewerPositionScaled = multiplyArray(viewerPosition, 1 / mapScale)

    // Initialize on first pass or whenever the viewer changes
    if (viewerEntity !== previousViewerEntity) {
      $previousViewerPosition.copy(viewerTransform.position)
    }

    // Find how far the viewer has travelled since last update, in real-world scale (scale=1)
    // TODO only compare x, z components of positions
    $vector3.subVectors(viewerTransform.position, $previousViewerPosition).divideScalar(mapScale)
    const viewerPositionDeltaNormalScale = vector3ToArray2($vector3)
    const viewerDistanceFromCenter = Math.hypot(...viewerPositionDeltaNormalScale)

    if (viewerDistanceFromCenter >= mapComponent.triggerRefreshRadius) {
      mapComponent.center = fromMetersFromCenter(viewerPositionDeltaNormalScale, mapComponent.center)
      mapComponent.viewerPosition = viewerPosition
      actuateLazy(mapComponent, getPhases())

      $previousViewerPosition.copy(viewerTransform.position)
      $previousViewerPosition.y = 0
      shouldUpdateChildren = true
    }

    if (shouldUpdateChildren) {
      // Perf hack: Start with an empty array so that any children that have been purged or that do not meet the criteria for adding are implicitly removed.
      const subSceneChildren = []
      for (const object of mapComponent.completeObjects.values()) {
        // TODO(perf) use a quad tree? or a good enough distance calc that doesn't use sqrt/hypot?
        if (object.mesh) {
          if (
            isIntersectCircleCircle(
              viewerPositionScaled,
              mapComponent.minimumSceneRadius,
              object.centerPoint,
              object.boundingCircleRadius
            )
          ) {
            setPosition(object.mesh, object.centerPoint)
            addChildFast(object3dComponent.value, object.mesh, subSceneChildren)
          } else {
            object.mesh.parent = null
          }
        }
      }
      for (const label of mapComponent.labelCache.values()) {
        if (label.mesh) {
          if (
            isIntersectCircleCircle(
              viewerPositionScaled,
              mapComponent.labelRadius,
              label.centerPoint,
              label.boundingCircleRadius
            )
          ) {
            setPosition(label.mesh, label.centerPoint)
            addChildFast(object3dComponent.value, label.mesh, subSceneChildren)
          } else {
            label.mesh.parent = null
          }
        }
      }
      for (const helpers of mapComponent.helpersCache.values()) {
        if (helpers.tileNavMesh) {
          addChildFast(object3dComponent.value, helpers.tileNavMesh, subSceneChildren)
        } else {
          helpers.tileNavMesh.parent = null
        }
      }

      // Update (sub)scene
      object3dComponent.value.children = subSceneChildren
      shouldUpdateChildren = false
    }

    // Update labels
    if (Math.round(world.fixedElapsedTime / world.fixedDelta) % 20 === 0) {
      for (const label of mapComponent.labelCache.values()) {
        if (label.mesh) {
          if (
            isIntersectCircleCircle(
              viewerPositionScaled,
              mapComponent.labelRadius,
              label.centerPoint,
              label.boundingCircleRadius
            )
          ) {
            label.mesh.update()
          }
        }
      }
    }
    previousViewerEntity = viewerEntity
    return world
  }
}
