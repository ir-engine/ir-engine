import { CircleBufferGeometry, Color, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/EntityFunctions'
import { createCollider } from '../../physics/behaviors/createCollider'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { Object3DComponent } from '../components/Object3DComponent'

type GroundProps = {
  color: string
  visible: boolean
}

export const createGround = (entity: Entity, args: GroundProps) => {
  const mesh = new Mesh(
    new CircleBufferGeometry(1000, 32).rotateX(-Math.PI / 2),
    new MeshStandardMaterial({
      color: new Color(args.color),
      roughness: 0
    })
  )
  mesh.receiveShadow = true

  if (typeof args.visible !== 'undefined' && args.visible) mesh.visible = false
  addComponent(entity, Object3DComponent, { value: mesh })

  const body = createCollider(
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
