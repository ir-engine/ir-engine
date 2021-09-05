import { defineQuery, defineSystem, System } from 'bitecs'
import refreshSceneObjects from './functions/refreshSceneObjects'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { GeoLabelSetComponent } from './GeoLabelSetComponent'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { getResultsQueue, llToScene, resetQueues, sceneToLl } from './MeshBuilder'
import { vector3ToArray2 } from './util'
import { Mesh, Object3D, Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { createMapObjects } from '.'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { GeoLabelNode } from './GeoLabelNode'

const $vector3 = new Vector3()
const $mapObjectsInScene = new Map<string, Mesh>()
const $mapObjectsToRemove = new Set<string>()
const $previousViewerPosition = new Vector3()

export const MapUpdateSystem = async (args: { getViewerEntity: () => Entity }): Promise<System> => {
  const mapsQuery = defineQuery([MapComponent])
  const labelsQuery = defineQuery([GeoLabelSetComponent])
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
    const meshesByTaskId = getResultsQueue()

    $vector3.subVectors(viewerTransform.position, $previousViewerPosition)
    const viewerPositionDelta = vector3ToArray2($vector3)
    $vector3.divideScalar(mapScale)
    const viewerPositionDeltaScaled = vector3ToArray2($vector3)

    const viewerDistanceFromCenter = Math.hypot(...viewerPositionDelta)

    if (viewerDistanceFromCenter >= mapComponent.triggerRefreshRadius * mapScale) {
      resetQueues()
      mapComponent.center = sceneToLl(viewerPositionDeltaScaled, mapComponent.center)
      const promise = createMapObjects(mapComponent.center, mapComponent.minimumSceneRadius, mapComponent.args)

      $previousViewerPosition.copy(viewerTransform.position)
      $previousViewerPosition.y = 0

      updateLabels(promise, getComponent(mapEntity, GeoLabelSetComponent), object3dComponent.value)
    }

    $mapObjectsInScene.forEach((_, featureUUID) => {
      $mapObjectsToRemove.add(featureUUID)
    })

    Object.entries(meshesByTaskId).forEach(([featureUUID, { mesh, geographicCenterPoint }]) => {
      if (mesh) {
        const sceneCenterPoint = llToScene(geographicCenterPoint, mapComponent.originalCenter)
        if (!$mapObjectsInScene.has(featureUUID)) {
          mesh.position.set(sceneCenterPoint[0], 0, -sceneCenterPoint[1])
          object3dComponent.value.add(mesh)
          $mapObjectsInScene.set(featureUUID, mesh)
        }
        $mapObjectsToRemove.delete(featureUUID)
      }
    })

    $mapObjectsToRemove.forEach((featureUUID) => {
      const mesh = $mapObjectsInScene.get(featureUUID)
      object3dComponent.value.remove(mesh)
    })

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

async function updateLabels(
  promise: Promise<{ labels: GeoLabelNode[] }>,
  labelsComponent: { value: Set<GeoLabelNode> },
  mapObject3D: Object3D
): Promise<void> {
  const { labels } = await promise
  labelsComponent.value.forEach((label) => {
    mapObject3D.remove(label.object3d)
  })

  labels.forEach((label) => {
    mapObject3D.add(label.object3d)
  })

  labelsComponent.value = new Set(labels)
}
