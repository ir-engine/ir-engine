import { System } from '../ecs/classes/System'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { fromMetersFromCenter } from './functions/UnitConversionFunctions'
import { addChildFast, multiplyArray, setPosition, vector3ToArray2 } from './util'
import { Object3D, Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { getComponent, defineQuery } from '../ecs/functions/ComponentFunctions'
import { World } from '../ecs/classes/World'
import actuateLazy from './functions/actuateLazy'
import getPhases from './functions/getPhases'
import isIntersectCircleCircle from './functions/isIntersectCircleCircle'
import { MAX_CACHED_FEATURES } from './functions/createStore'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { NavMeshComponent } from '../navigation/component/NavMeshComponent'

const $vector3 = new Vector3()

/** Track where the viewer was the last time we kicked off a new set of map contruction tasks */
const $previousViewerPosition = new Vector3()

export default async function MapUpdateSystem(world: World): Promise<System> {
  const mapsQuery = defineQuery([MapComponent])
  const viewerQuery = defineQuery([AvatarComponent])
  const navMeshQuery = defineQuery([NavMeshComponent])
  let previousViewerEntity: Entity
  let shouldUpdateChildren = true

  return () => {
    const viewerEntity = viewerQuery(world)[0]
    const mapEntities = mapsQuery(world)
    const mapEntity = mapEntities[0]
    const navPlaneEntity = navMeshQuery(world)[0]
    // Sanity checks
    if (!mapEntity || !viewerEntity) return
    if (mapEntities.length > 1) console.warn('Not supported: More than one map!')
    const mapComponent = getComponent(mapEntity, MapComponent)
    const mapScale = getComponent(mapEntity, TransformComponent).scale.x
    const object3dComponent = getComponent(mapEntity, Object3DComponent)
    const viewerTransform = getComponent(viewerEntity, TransformComponent)
    const viewerPosition = vector3ToArray2(viewerTransform.position)
    const viewerPositionScaled = multiplyArray(viewerPosition, 1 / mapScale)
    const navigationRaycastTarget = getComponent(navPlaneEntity, NavMeshComponent).navTarget

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
      actuateLazy(mapComponent, getPhases({ exclude: ['navigation'] }))

      $previousViewerPosition.copy(viewerTransform.position)
      $previousViewerPosition.y = 0
      shouldUpdateChildren = true
    }

    if (shouldUpdateChildren) {
      // Perf hack: Start with an empty array so that any children that have been purged or that do not meet the criteria for adding are implicitly removed.
      const subSceneChildren = []
      for (const key of mapComponent.completeObjects.keys()) {
        const object = mapComponent.completeObjects.get(key)
        if (object.mesh) {
          if (
            isIntersectCircleCircle(
              viewerPositionScaled,
              mapComponent.minimumSceneRadius,
              object.centerPoint,
              object.boundingCircleRadius
            ) &&
            key[0] !== 'landuse_fallback'
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
      navigationRaycastTarget.children.length = 0
      for (const key of mapComponent.completeObjects.keys()) {
        const layerName = key[0]
        if (layerName === 'landuse_fallback') {
          const { mesh, centerPoint } = mapComponent.completeObjects.get(key)
          setPosition(mesh, centerPoint)

          addChildFast(navigationRaycastTarget, mesh)
        }
      }
      for (const helpers of mapComponent.helpersCache.values()) {
        if (helpers.tileNavMesh) {
          addChildFast(object3dComponent.value, helpers.tileNavMesh, subSceneChildren)
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
