import { getComponent, addComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { MapComponent } from '../MapComponent'
import { Entity } from '../../ecs/classes/Entity'
import { ECSWorld } from '../../ecs/classes/World'
import { createMapObjects } from '..'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

// const map = getComponent(mapEntity, MapComponent, false, ecsWorld)
// const mapScale = getComponent(mapEntity, TransformComponent).scale.x
// const longtitude = viewerPosition.x / (111134.861111 * mapScale) + startLong
// const latitude = -viewerPosition.z / (Math.cos((startLat * PI) / 180) * 111321.377778 * mapScale) + startLat
// const loadingTile = llToTile([longtitude, latitude])
// console.log('updateMap to tile', loadingTile)
// const { mapMesh, navMesh, groundMesh } = await createMapObjects(map.center, [longtitude, latitude], map.args)
// map.currentTile = loadingTile
// /*
// // TODO: it does not work this way, but probably should
// removeComponent(entity, Object3DComponent)
// addComponent(entity, Object3DComponent, { value: mapMesh })
//  */
// const mapObjectComponent = getComponent(entity, Object3DComponent)
// const prevMapMesh = mapObjectComponent.value
// mapMesh.position.copy(prevMapMesh.position)
// mapMesh.rotation.copy(prevMapMesh.rotation)
// mapMesh.scale.copy(prevMapMesh.scale)
// prevMapMesh.parent.add(mapMesh)
// prevMapMesh.removeFromParent()
// mapObjectComponent.value = mapMesh
// // getComponent(currentEnt, Object3DComponent).value.clear()
// // getComponent(currentEnt, Object3DComponent).value.add(mapMesh)
// // TODO check and fix
// removeComponent(entity, NavMeshComponent)
// if (navMesh && groundMesh) {
//   addComponent(entity, NavMeshComponent, {
//     yukaNavMesh: navMesh,
//     navTarget: groundMesh
//   })
// }
// map.loading = false

export async function refreshSceneObjects(mapEntity: Entity, ecsWorld: ECSWorld): Promise<void> {
  const map = getComponent(mapEntity, MapComponent, false, ecsWorld)
  const { mapMesh } = await createMapObjects(map.center, map.args)
  const mapTransform = getComponent(mapEntity, TransformComponent, false, ecsWorld)
  const viewerTransform = getComponent(map.viewer, TransformComponent, false, ecsWorld)

  removeComponent(mapEntity, Object3DComponent, ecsWorld)
  // TODO try using a setImmediate around addComponent
  addComponent(mapEntity, Object3DComponent, { value: mapMesh }, ecsWorld)

  mapTransform.position.copy(viewerTransform.position)
}
