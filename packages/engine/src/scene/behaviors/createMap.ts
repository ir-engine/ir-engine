import { Engine } from '../../ecs/classes/Engine'
import { create } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'

export async function createMap(entity, args: MapProps): Promise<void> {
  const mapMesh = await create(Engine.renderer, args)
  Engine.scene.add(mapMesh)
  console.log('map added, navmesh?', mapMesh.userData.navMesh)
  if (mapMesh.userData.navMesh) {
    addComponent(entity, NavMeshComponent, {
      yukaNavMesh: mapMesh.userData.navMesh
    })
    addComponent(entity, DebugNavMeshComponent, null)
  }
}
