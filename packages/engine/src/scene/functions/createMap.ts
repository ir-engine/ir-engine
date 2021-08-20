import { Engine } from '../../ecs/classes/Engine'
import { create, update } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'

let currentEnt

export async function createMap(entity: Entity, args: MapProps): Promise<void> {
  const { mapMesh, navMesh, groundMesh } = await create(Engine.renderer, args)
  addComponent(entity, Object3DComponent, {
    value: mapMesh
  })
  addComponent(entity, NavMeshComponent, {
    yukaNavMesh: navMesh,
    navTarget: groundMesh
  })
  if (args.enableDebug) {
    addComponent(entity, DebugNavMeshComponent, null)
  }
  currentEnt = entity
}

export async function updateMap(args: MapProps, longtitude, latitude, position): Promise<void> {
  const remobj = Engine.scene.getObjectByName('MapObject')
  const { mapMesh, navMesh, groundMesh } = await update(Engine.renderer, args, longtitude, latitude, position)

  remobj.removeFromParent()
  Engine.scene.add(mapMesh)

  // getComponent(currentEnt, Object3DComponent).value.clear()
  // getComponent(currentEnt, Object3DComponent).value.add(mapMesh)

  getComponent(currentEnt, NavMeshComponent).navTarget.clear()
  getComponent(currentEnt, NavMeshComponent).navTarget.add(groundMesh)
  getComponent(currentEnt, NavMeshComponent).yukaNavMesh = navMesh
}
