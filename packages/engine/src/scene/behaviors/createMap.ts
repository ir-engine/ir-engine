import { Engine } from '../../ecs/classes/Engine'
import { create } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'

export async function createMap(entity, args: MapProps): Promise<void> {
  const { mapMesh, navMesh } = await create(Engine.renderer, args)
  console.log('mapMesh', mapMesh)
  // TODO remove scene.add and instead use addComponent Object3DComponent to make it raycast-able
  Engine.scene.add(mapMesh)
  // addComponent(entity, Object3DComponent, {
  //   value: mapMesh
  // })
  console.log('map added, navmesh?', navMesh)
  if (navMesh) {
    addComponent(entity, NavMeshComponent, {
      yukaNavMesh: navMesh
    })
    addComponent(entity, DebugNavMeshComponent, null)
  }
}
