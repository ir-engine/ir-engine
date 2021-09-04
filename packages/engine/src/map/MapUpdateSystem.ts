import { defineQuery, defineSystem, System } from 'bitecs'
import refreshSceneObjects from './functions/refreshSceneObjects'
import { Engine } from '../ecs/classes/Engine'
import { ECSWorld } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { GeoLabelSetComponent } from './GeoLabelSetComponent'
import { MapComponent } from './MapComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { getResultsQueue, resetQueues, sceneToLl } from './MeshBuilder'
import { vector3ToArray2 } from './util'
import { Mesh, Object3D, Vector3 } from 'three'
import { Entity } from '../ecs/classes/Entity'
import { createMapObjects } from '.'
import { Object3DComponent } from '../scene/components/Object3DComponent'
import { GeoLabelNode } from './GeoLabelNode'

const $vector3 = new Vector3()
const $mapObjectsInScene = new Map<number, Mesh>()

export const MapUpdateSystem = async (args: { getViewerEntity: () => Entity }): Promise<System> => {
  const mapsQuery = defineQuery([MapComponent])
  const labelsQuery = defineQuery([GeoLabelSetComponent])

  return defineSystem((world: ECSWorld) => {
    const viewerEntity = args.getViewerEntity()
    const mapEntities = mapsQuery(world)
    if (viewerEntity === undefined) return
    if (mapEntities.length === 0) return
    if (mapEntities.length > 1) console.warn('Not supported: More than one map!')

    const mapEntity = mapEntities[0]
    const mapComponent = getComponent(mapEntity, MapComponent)
    const mapTransform = getComponent(mapEntity, TransformComponent, false, world)
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)
    const object3dComponent = getComponent(mapEntity, Object3DComponent, false, world)

    $vector3.subVectors(viewerTransform.position, mapTransform.position)
    const viewerPositionDelta = vector3ToArray2($vector3)
    $vector3.divide(mapTransform.scale)
    const viewerPositionDeltaScaled = vector3ToArray2($vector3)

    const viewerDistanceFromCenter = Math.hypot(...viewerPositionDelta)

    if (viewerDistanceFromCenter >= mapComponent.triggerRefreshRadius * mapTransform.scale.x) {
      resetQueues()
      mapComponent.center = sceneToLl(viewerPositionDeltaScaled, mapComponent.center)
      const promise = createMapObjects(mapComponent.center, mapComponent.minimumSceneRadius, mapComponent.args)

      mapTransform.position.copy(viewerTransform.position)
      mapTransform.position.y = 0

      updateLabels(
        promise,
        getComponent(mapEntity, GeoLabelSetComponent),
        object3dComponent.value,
        mapTransform.position
      )

      for (const [id, mesh] of $mapObjectsInScene.entries()) {
        const distanceFromViewer = mesh.position.distanceTo(viewerTransform.position)
        if (distanceFromViewer > mapComponent.minimumSceneRadius) {
          console.log('deleting mesh', distanceFromViewer, 'm away')
          $mapObjectsInScene.delete(id)
          object3dComponent.value.remove(mesh)
        }
      }
    }

    const meshesByTaskId = getResultsQueue()
    meshesByTaskId.forEach((mesh, taskId) => {
      if (mesh && !$mapObjectsInScene.has(taskId)) {
        mesh.position.copy(viewerTransform.position)
        mesh.position.y = 0
        object3dComponent.value.add(mesh)
        $mapObjectsInScene.set(taskId, mesh)
      }
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
  mapObject3D: Object3D,
  mapPosition: Vector3
): Promise<void> {
  const { labels } = await promise
  labelsComponent.value.forEach((label) => {
    mapObject3D.remove(label.object3d)
  })

  labels.forEach((label) => {
    label.object3d.position.add(mapPosition)
    mapObject3D.add(label.object3d)
  })

  labelsComponent.value = new Set(labels)
}
