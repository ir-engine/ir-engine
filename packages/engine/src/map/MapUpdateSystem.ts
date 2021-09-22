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
import actuateLazy from './functions/actuateLazy'
import getPhases from './functions/getPhases'
import isIntersectCircleCircle from '../../tests/map/functions/isIntersectCircleCircle'

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
    }

    // Perf hack: Start with an empty array so that any children that have been purged or that do not meet the criteria for adding are implicitly removed.
    const subSceneChildren = []
    for (const object of mapComponent.completeObjects.values()) {
      // TODO(perf) use a quad tree? or a good enough distance calc that doesn't use sqrt/hypot?
      if (
        object.mesh &&
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
    for (const label of mapComponent.labelCache.values()) {
      if (
        label.mesh &&
        isIntersectCircleCircle(
          viewerPositionScaled,
          mapComponent.labelRadius,
          label.centerPoint,
          label.boundingCircleRadius
        )
      ) {
        setPosition(label.mesh, label.centerPoint)
        addChildFast(object3dComponent.value, label.mesh, subSceneChildren)
        // TODO don't do this every frame
        label.mesh.update()
      } else {
        label.mesh.parent = null
      }
    }

    // Update (sub)scene
    object3dComponent.value.children = subSceneChildren

    previousViewerEntity = viewerEntity
    return world
  }
}

function addChildFast(parent: Object3D, child: Object3D, children = parent.children) {
  child.parent = parent
  children.push(child)
}

function setPosition(object3d: Object3D, centerPoint: [number, number]) {
  object3d.position.set(centerPoint[0], 0, centerPoint[1])
}
