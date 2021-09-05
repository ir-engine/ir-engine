import { defineQuery, defineSystem, System } from 'bitecs'
import refreshSceneObjects from './functions/refreshSceneObjects'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { GeoLabelSetComponent } from './GeoLabelSetComponent'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { getResultsForFeature, getUUIDsForCompletedFeatures, llToScene, resetQueues, sceneToLl } from './MeshBuilder'
import { vector3ToArray2 } from './util'
import { Mesh, Object3D, Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { createMapObjects } from '.'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { GeoLabelNode } from './GeoLabelNode'
import { LongLat } from './types'

const $vector3 = new Vector3()
const $mapObjectsInScene = new Map<string, { mesh?: Mesh; label?: GeoLabelNode }>()
const $mapObjectsToRemove = new Set<string>()
const $previousViewerPosition = new Vector3()

export const MapUpdateSystem = async (args: { getViewerEntity: () => Entity }): Promise<System> => {
  const mapsQuery = defineQuery([MapComponent])
  let viewerEntity: Entity

  return defineSystem((world: ECSWorld) => {
    const newViewerEntity = args.getViewerEntity()
    const mapEntities = mapsQuery(world)
    if (newViewerEntity === undefined) return
    if (mapEntities.length === 0) return
    if (mapEntities.length > 1) console.warn('Not supported: More than one map!')

    if (newViewerEntity !== viewerEntity) {
      viewerEntity = newViewerEntity
      const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)
      $previousViewerPosition.copy(viewerTransform.position)
    }

    const mapEntity = mapEntities[0]
    const mapComponent = getComponent(mapEntity, MapComponent)
    const mapScale = getComponent(mapEntity, TransformComponent, false, world).scale.x
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)
    const object3dComponent = getComponent(mapEntity, Object3DComponent, false, world)
    const completedUUIDs = getUUIDsForCompletedFeatures()

    $vector3.subVectors(viewerTransform.position, $previousViewerPosition)
    const viewerPositionDelta = vector3ToArray2($vector3)
    $vector3.divideScalar(mapScale)
    const viewerPositionDeltaScaled = vector3ToArray2($vector3)

    const viewerDistanceFromCenter = Math.hypot(...viewerPositionDelta)

    if (viewerDistanceFromCenter >= mapComponent.triggerRefreshRadius * mapScale) {
      resetQueues()
      mapComponent.center = sceneToLl(viewerPositionDeltaScaled, mapComponent.center)
      createMapObjects(mapComponent.center, mapComponent.minimumSceneRadius, mapComponent.args)

      $previousViewerPosition.copy(viewerTransform.position)
      $previousViewerPosition.y = 0
    }

    $mapObjectsInScene.forEach((_, featureUUID) => {
      $mapObjectsToRemove.add(featureUUID)
    })

    completedUUIDs.forEach((featureUUID) => {
      const {
        mesh: { mesh, geographicCenterPoint },
        label
      } = getResultsForFeature(featureUUID)
      const objectInScene = $mapObjectsInScene.get(featureUUID)
      if (mesh && (!objectInScene || !objectInScene.mesh)) {
        setPosition(mesh, geographicCenterPoint, mapComponent.originalCenter)
        object3dComponent.value.add(mesh)
        updateMap($mapObjectsInScene, featureUUID, (value) => ({ ...value, mesh }), {})
      }
      if (label && (!objectInScene || !objectInScene.label)) {
        setPosition(label.object3d, label.geoMiddleSlice[0], mapComponent.originalCenter)
        object3dComponent.value.add(label.object3d)
        updateMap($mapObjectsInScene, featureUUID, (value) => ({ ...value, label }), {})
      }
      $mapObjectsToRemove.delete(featureUUID)
    })

    $mapObjectsToRemove.forEach((featureUUID) => {
      const { mesh, label } = $mapObjectsInScene.get(featureUUID)
      if (mesh) {
        object3dComponent.value.remove(mesh)
      }
      if (label) {
        object3dComponent.value.remove(label.object3d)
      }
      $mapObjectsInScene.delete(featureUUID)
    })

    $mapObjectsInScene.forEach(({ label }) => {
      if (label) {
        label.onUpdate(Engine.camera)
      }
    })

    return world
  })
}

function setPosition(object3d: Object3D, geographicPoint: LongLat, mapOriginalCenter: LongLat) {
  const scenePoint = llToScene(geographicPoint, mapOriginalCenter)
  // Note that latitude values are flipped relative to our scene's Z axis
  object3d.position.set(scenePoint[0], 0, -scenePoint[1])
}

function updateMap<K, V>(map: Map<K, V>, key: K, updateFn: (value: V) => V, initialValue: V) {
  map.set(key, updateFn(map.get(key) || initialValue))
}
