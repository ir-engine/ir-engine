import { Engine } from '../../ecs/classes/Engine'
import { create } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Mesh, MeshLambertMaterial, SphereGeometry } from 'three'

export async function createMap(entity, args: MapProps): Promise<void> {
  const { mapMesh, navMesh, groundMesh, roadsMesh } = await create(Engine.renderer, args)
  console.log('mapMesh', mapMesh)
  addComponent(entity, Object3DComponent, {
    value: mapMesh
  })
  console.log('map added, navmesh?', navMesh)
  // if (navMesh) {
  addComponent(entity, NavMeshComponent, {
    yukaNavMesh: navMesh,
    navTarget: groundMesh
  })
  addComponent(entity, DebugNavMeshComponent, null)
  // }
}
