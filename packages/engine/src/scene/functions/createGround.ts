import { CircleBufferGeometry, Color, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { addObject3DComponent } from './addObject3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

type GroundProps = {
  color: string
}

const halfTurnX = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export const createGround = async function (entity: Entity, args: GroundProps, isClient: boolean): Promise<Mesh> {
  const mesh = new Mesh(
    new CircleBufferGeometry(1000, 32),
    new MeshStandardMaterial({
      color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
      roughness: 0
    })
  )

  getComponent(entity, TransformComponent).rotation.multiply(halfTurnX)

  addObject3DComponent(entity, mesh, { receiveShadow: true, 'material.color': args.color })

  mesh.userData = {
    type: 'ground',
    collisionLayer: CollisionGroups.Ground,
    collisionMask: CollisionGroups.Default
  }

  createCollider(entity, mesh)

  return mesh
}
