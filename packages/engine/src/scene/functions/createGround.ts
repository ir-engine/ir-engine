import { Mesh } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, addComponent } from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { Object3DComponent } from '../components/Object3DComponent'
import { GroundPlaneComponent, GroundPlaneData } from '../components/GroundPlaneComponent'

export const createGround = async function (entity: Entity, args: any, isEditor?: boolean): Promise<Mesh> {
  const object3DComponent = getComponent(entity, Object3DComponent)
  const mesh = object3DComponent.value as Mesh

  addComponent<GroundPlaneData, {}>(
    entity,
    GroundPlaneComponent,
    new GroundPlaneData(mesh, args)
  )

  if (!isEditor) createCollider(entity, mesh)

  return mesh
}
