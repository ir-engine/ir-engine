import { Engine } from '../../ecs/classes/Engine'
import { create } from '../../map'
import { MapProps } from '../../map/MapProps'
import { addComponent } from '../../ecs/functions/EntityFunctions'
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
  addComponent(entity, DebugNavMeshComponent, null)
}
