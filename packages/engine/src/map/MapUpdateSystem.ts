import { System } from '../ecs/classes/System'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { fromMetersFromCenter, LongLat } from './functions/UnitConversionFunctions'
import { addChildFast, multiplyArray, setPosition, vectorToArray } from './util'
import { Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { getComponent, defineQuery, addComponent } from '../ecs/functions/ComponentFunctions'
import { World } from '../ecs/classes/World'
import isIntersectCircleCircle from './functions/isIntersectCircleCircle'
import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { NavMeshComponent } from '../navigation/component/NavMeshComponent'
import { accessMapState } from './MapReceptor'
import { Downgraded } from '@hookstate/core'
import { getPhases, startPhases, resetPhases } from './functions/PhaseFunctions'
import { TargetCameraRotationComponent } from '../camera/components/TargetCameraRotationComponent'

const PI2 = Math.PI * 2
const $vector3 = new Vector3()
const $normalScaleViewerPositionDelta = new Array(2) as [number, number]

/** Track where the viewer was the last time we kicked off a new set of map contruction tasks */
const $previousViewerPosition = new Vector3()
const $previousMapCenterPoint: LongLat = Array(2)

export default async function MapUpdateSystem(world: World): Promise<System> {
  const mapsQuery = defineQuery([MapComponent])
  const viewerQuery = defineQuery([AvatarComponent])
  const navMeshQuery = defineQuery([NavMeshComponent])
  const phases = await getPhases({ exclude: ['navigation'] })
  let previousViewerEntity: Entity
  let spinnerAngle = 0

  return () => {
    const viewerEntity = viewerQuery(world)[0]
    const mapEntities = mapsQuery(world)
    const mapEntity = mapEntities[0]
    const navPlaneEntity = navMeshQuery(world)[0]
    // Sanity checks
    if (!mapEntity || !viewerEntity) return world
    if (mapEntities.length > 1) console.warn('Not supported: More than one map!')
    const mapState = accessMapState().attach(Downgraded).get()
    const mapScale = mapState.scale
    const object3dComponent = getComponent(mapEntity, Object3DComponent)
    const viewerTransform = getComponent(viewerEntity, TransformComponent)
    const viewerPosition = vectorToArray(viewerTransform.position)
    const viewerPositionScaled = multiplyArray(viewerPosition, 1 / mapScale)
    const navigationRaycastTarget = getComponent(navPlaneEntity, NavMeshComponent).navTarget
    const avatar = getComponent(viewerEntity, AvatarComponent)

    // Initialize on first pass or whenever the viewer changes
    if (viewerEntity !== previousViewerEntity) {
      $previousViewerPosition.copy(viewerTransform.position)
    }

    // Find how far the viewer has travelled since last update, in real-world scale (scale=1)
    // TODO only compare x, z components of positions
    $vector3.subVectors(viewerTransform.position, $previousViewerPosition).divideScalar(mapScale)
    vectorToArray($vector3, $normalScaleViewerPositionDelta)
    const viewerDistanceFromCenterSquared =
      $normalScaleViewerPositionDelta[0] * $normalScaleViewerPositionDelta[0] +
      $normalScaleViewerPositionDelta[1] * $normalScaleViewerPositionDelta[1]

    const wasRefreshTriggered =
      viewerDistanceFromCenterSquared >= mapState.triggerRefreshRadius * mapState.triggerRefreshRadius
    const wasMapCenterUpdated =
      typeof $previousMapCenterPoint[0] !== 'undefined' &&
      typeof $previousMapCenterPoint[1] !== 'undefined' &&
      ($previousMapCenterPoint[0] !== mapState.center[0] || $previousMapCenterPoint[1] !== mapState.center[1])

    if (wasMapCenterUpdated) {
      mapState.viewerPosition[0] = $previousViewerPosition[0] = 0
      mapState.viewerPosition[1] = $previousViewerPosition[1] = 0
      viewerTransform.position.set(0, 0, 0)
      resetPhases(mapState, phases)
    }

    if (wasRefreshTriggered || wasMapCenterUpdated) {
      mapState.center = fromMetersFromCenter($normalScaleViewerPositionDelta, mapState.center)
      mapState.viewerPosition = viewerPosition
      startPhases(mapState, phases)

      $previousViewerPosition.copy(viewerTransform.position)
      $previousViewerPosition.y = 0
    }

    $previousMapCenterPoint[0] = mapState.center[0]
    $previousMapCenterPoint[1] = mapState.center[1]

    // Perf hack: Start with an empty array so that any children that have been purged or that do not meet the criteria for adding are implicitly removed.
    if (mapState.updateSpinner && mapState.activePhase !== null && mapState.completeObjects.size === 0) {
      const spinner = mapState.updateSpinner
      spinner.rotation.y = spinnerAngle
      spinnerAngle = (spinnerAngle + 0.01) % PI2

      object3dComponent.value.children.length = 0
      navigationRaycastTarget.children.length = 0
      object3dComponent.value.children[0] = spinner

      object3dComponent.value.children[1] = mapState.updateTextContainer!

      avatar.modelContainer.visible = false
      addComponent(viewerEntity, TargetCameraRotationComponent, {
        time: 0,
        phi: 0,
        theta: 0,
        phiVelocity: { value: Math.PI },
        thetaVelocity: { value: Math.PI }
      })
    } else if (mapState.activePhase === 'UpdateScene') {
      avatar.modelContainer.visible = true
      object3dComponent.value.children.length = 0
      for (const key of mapState.completeObjects.keys()) {
        const object = mapState.completeObjects.get(key)
        if (object.mesh) {
          if (
            isIntersectCircleCircle(
              viewerPositionScaled,
              mapState.minimumSceneRadius * mapState.scale,
              object.centerPoint,
              object.boundingCircleRadius
            ) &&
            key[0] !== 'landuse_fallback'
          ) {
            setPosition(object.mesh, object.centerPoint)
            addChildFast(object3dComponent.value, object.mesh)
          } else {
            object.mesh.parent = null
          }
        }
      }
      for (const label of mapState.labelCache.values()) {
        if (label.mesh) {
          if (
            isIntersectCircleCircle(
              viewerPositionScaled,
              mapState.labelRadius * mapState.scale,
              label.centerPoint,
              label.boundingCircleRadius
            )
          ) {
            setPosition(label.mesh, label.centerPoint)
            addChildFast(object3dComponent.value, label.mesh)
          } else {
            label.mesh.parent = null
          }
        }
      }
      navigationRaycastTarget.children.length = 0
      for (const key of mapState.completeObjects.keys()) {
        const layerName = key[0]
        if (layerName === 'landuse_fallback') {
          const { mesh, centerPoint } = mapState.completeObjects.get(key)
          setPosition(mesh, centerPoint)

          addChildFast(navigationRaycastTarget, mesh)
        }
      }
      for (const helpers of mapState.helpersCache.values()) {
        if (helpers.tileNavMesh) {
          addChildFast(object3dComponent.value, helpers.tileNavMesh)
        }
      }

      // Update (sub)scene
      mapState.activePhase = null
    }

    // Update labels
    if (Math.round(world.fixedElapsedTime / world.fixedDelta) % 20 === 0) {
      for (const label of mapState.labelCache.values()) {
        if (label.mesh) {
          if (
            isIntersectCircleCircle(
              viewerPositionScaled,
              mapState.labelRadius * mapState.scale,
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
