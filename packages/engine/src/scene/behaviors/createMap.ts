import { Engine } from '../../ecs/classes/Engine'
import { create } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import {Mesh, MeshLambertMaterial, SphereGeometry} from 'three'

export async function createMap(entity, args: MapProps): Promise<void> {
  const { mapMesh, navMesh, groundMesh, roadsMesh } = await create(Engine.renderer, args)
  console.log('mapMesh', mapMesh)
  // TODO remove scene.add and instead use addComponent Object3DComponent to make it raycast-able
  Engine.scene.add(mapMesh)
  Engine.scene.add(groundMesh)
  Engine.scene.add(roadsMesh)
  const g = new SphereGeometry(5, 10, 10)
  const m = new MeshLambertMaterial()
  const testMesh = new Mesh(g, m)
  Engine.scene.add(testMesh)
  addComponent(entity, Object3DComponent, {
    value: mapMesh
  })
  addComponent(entity, Object3DComponent, {
    value: groundMesh
  })
  addComponent(entity, Object3DComponent, {
    value: testMesh
  })
  console.log('map added, navmesh?', navMesh)
  if (navMesh) {
    addComponent(entity, NavMeshComponent, {
      yukaNavMesh: navMesh
    })
    addComponent(entity, DebugNavMeshComponent, null)
  }
}
