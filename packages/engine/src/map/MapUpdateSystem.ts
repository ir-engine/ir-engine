import { defineQuery, defineSystem, System } from 'bitecs'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { deleteResultsForFeature, getResultsForFeature, getValidUUIDs } from './MeshBuilder'
import { LongLat, toMetersFromCenter, fromMetersFromCenter } from './units'
import { vector3ToArray2 } from './util'
import { Mesh, Object3D, Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { enqueueTasks } from '.'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { GeoLabelNode } from './GeoLabelNode'
import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'

const $vector3 = new Vector3()
const $meshesInScene = new Map<string, Mesh>()
const $labelsInScene = new Map<string, GeoLabelNode>()
const $mapObjectsToRemove = new Set<string>()

/** Track where the viewer was the last time we kicked off a new set of map contruction tasks */
const $previousViewerPosition = new Vector3()

export const MapUpdateSystem = async (): Promise<System> => {
  const mapsQuery = defineQuery([MapComponent])
  const viewerQuery = defineQuery([FollowCameraComponent])
  let previousViewerEntity: Entity

  return defineSystem((world: ECSWorld) => {
    const viewerEntity = viewerQuery(world)[0]
    const mapEntities = mapsQuery(world)
    const mapEntity = mapEntities[0]
    // Sanity checks
    if (!mapEntity || !viewerEntity) return
    if (mapEntities.length > 1) console.warn('Not supported: More than one map!')
    const mapComponent = getComponent(mapEntity, MapComponent)
    const mapScale = getComponent(mapEntity, TransformComponent, false, world).scale.x
    const object3dComponent = getComponent(mapEntity, Object3DComponent, false, world)
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)

    if (viewerEntity !== previousViewerEntity) {
      $previousViewerPosition.copy(viewerTransform.position)
    }

    $vector3.subVectors(viewerTransform.position, $previousViewerPosition)
    const viewerPositionDelta = vector3ToArray2($vector3)
    $vector3.divideScalar(mapScale)
    const viewerPositionDeltaScaled = vector3ToArray2($vector3)

    const viewerDistanceFromCenter = Math.hypot(...viewerPositionDelta)

    if (
      viewerDistanceFromCenter >= mapComponent.triggerRefreshRadius * mapScale ||
      viewerEntity !== previousViewerEntity
    ) {
      mapComponent.center = fromMetersFromCenter(viewerPositionDeltaScaled, mapComponent.center)
      enqueueTasks(mapComponent.center, mapComponent.minimumSceneRadius, mapComponent.args)

      $previousViewerPosition.copy(viewerTransform.position)
      $previousViewerPosition.y = 0
    }

    $meshesInScene.forEach((_, featureUUID) => {
      $mapObjectsToRemove.add(featureUUID)
    })

    for (const featureUUID of getValidUUIDs()) {
      const {
        mesh: { mesh, geographicCenterPoint },
        label
      } = getResultsForFeature(featureUUID)
      if (mesh && !$meshesInScene.has(featureUUID)) {
        const distance = computeDistanceFromMesh(mesh, copyAndScale(viewerTransform.position, 1 / mapScale))
        if (distance < mapComponent.minimumSceneRadius) {
          setPosition(mesh, geographicCenterPoint, mapComponent.originalCenter)
          object3dComponent.value.add(mesh)
          $meshesInScene.set(featureUUID, mesh)
          $mapObjectsToRemove.delete(featureUUID)
        }
      }
      if (label && !$labelsInScene.has(featureUUID)) {
        setPosition(label.object3d, label.geoMiddleSlice[0], mapComponent.originalCenter)
        object3dComponent.value.add(label.object3d)
        $labelsInScene.set(featureUUID, label)
        $mapObjectsToRemove.delete(featureUUID)
      }
    }

    $mapObjectsToRemove.forEach((featureUUID) => {
      const mesh = $meshesInScene.get(featureUUID)
      const label = $labelsInScene.get(featureUUID)
      if (mesh) {
        const distance = computeDistanceFromMesh(mesh, copyAndScale(viewerTransform.position, 1 / mapScale))
        if (distance > mapComponent.minimumSceneRadius) {
          object3dComponent.value.remove(mesh)
          if (label) {
            object3dComponent.value.remove(label.object3d)
          }
          $meshesInScene.delete(featureUUID)
          $labelsInScene.delete(featureUUID)
        }
        if (distance > mapComponent.minimumSceneRadius * 2) {
          deleteResultsForFeature(featureUUID)
        }
      }
    })

    $labelsInScene.forEach((label) => {
      if (label) {
        label.onUpdate(Engine.camera)
      }
    })

    previousViewerEntity = viewerEntity
    return world
  })
}

function computeDistanceFromMesh(mesh: Mesh, point: Vector3) {
  if (!mesh.geometry.boundingSphere) {
    mesh.geometry.computeBoundingSphere()
  }
  return mesh.position.distanceTo(point) - mesh.geometry.boundingSphere.radius
}

function copyAndScale(vector: Vector3, scalar: number) {
  return $vector3.copy(vector).multiplyScalar(scalar)
}

function setPosition(object3d: Object3D, geographicPoint: LongLat, mapOriginalCenter: LongLat) {
  const scenePoint = toMetersFromCenter(geographicPoint, mapOriginalCenter)
  // Note that latitude values are flipped relative to our scene's Z axis
  object3d.position.set(scenePoint[0], 0, -scenePoint[1])
}
