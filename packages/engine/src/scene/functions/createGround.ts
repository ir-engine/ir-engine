import { Mesh, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, addComponent } from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { GroundPlaneComponent, GroundPlaneData } from '../components/GroundPlaneComponent'

type GroundProps = {
  color: string
}

const halfTurnX = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export const createGround = async function (entity: Entity, args: any, isClient: boolean): Promise<Mesh> {
  const object3DComponent = getComponent(entity, Object3DComponent)

  addComponent<GroundPlaneData, {}>(
    entity,
    GroundPlaneComponent,
    new GroundPlaneData(object3DComponent.value as Mesh, args)
  )

  getComponent(entity, TransformComponent).rotation.multiply(halfTurnX)

  const mesh = object3DComponent.value as Mesh

  createCollider(entity, mesh)

  return mesh
}
