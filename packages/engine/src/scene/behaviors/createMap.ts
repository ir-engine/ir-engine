import { Engine } from '../../ecs/classes/Engine'
import { create, update } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { DebugNavMeshComponent } from '../../debug/DebugNavMeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { Entity } from '../../ecs/classes/Entity'

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
}

export async function updateMap(entity: Entity, args: MapProps, longtitude, latitude, position): Promise<void> {
  const { mapMesh, navMesh, groundMesh } = await update(Engine.renderer, args, longtitude, latitude, position)
  // addComponent(entity, Object3DComponent, {
  //   value: mapMesh
  // })
  // const gg = getComponent(entity , Object3DComponent)
  // console.log(gg)
  // addComponent(entity, NavMeshComponent, {
  //   yukaNavMesh: navMesh,
  //   navTarget: groundMesh
  // })
  // if (args.enableDebug) {
  //   addComponent(entity, DebugNavMeshComponent, null)
  // }
}
