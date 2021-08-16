import { CircleBufferGeometry, Color, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { createCollider } from '../../physics/behaviors/createCollider'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { addObject3DComponent } from './addObject3DComponent'

type GroundProps = {
  color: string
}

export const createGround = (entity: Entity, args: GroundProps) => {
  const mesh = new Mesh(
    new CircleBufferGeometry(1000, 32).rotateX(-Math.PI / 2),
    new MeshStandardMaterial({
      color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
      roughness: 0
    })
  )

  addObject3DComponent(entity, mesh, { receiveShadow: true, 'material.color': args.color })

  const body = createCollider(
    entity,
    {
      userData: {
        type: 'ground',
        collisionLayer: CollisionGroups.Ground,
        collisionMask: CollisionGroups.Default
      }
    },
    new Vector3().copy(mesh.position),
    new Quaternion().copy(mesh.quaternion),
    new Vector3().copy(mesh.scale)
  )

  addComponent(entity, ColliderComponent, { body })
}
