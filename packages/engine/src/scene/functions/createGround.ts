import { CircleBufferGeometry, Color, Group, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { createCollider } from '../../physics/functions/createCollider'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'

type GroundProps = {
  color: string
  generateNavmesh: boolean
}

const halfTurnX = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)

export const createGround = async function (entity: Entity, args: GroundProps, isClient: boolean): Promise<Mesh> {
  const mesh = new Mesh(
    new CircleBufferGeometry(1000, 32),
    new MeshStandardMaterial({
      color: args.color ?? new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
      roughness: 0
    })
  )
  mesh.receiveShadow = true

  getComponent(entity, TransformComponent).rotation.multiply(halfTurnX)

  addComponent(entity, Object3DComponent, { value: mesh })

  mesh.userData = {
    type: 'ground',
    collisionLayer: CollisionGroups.Ground,
    collisionMask: CollisionGroups.Default
  }

  createCollider(entity, mesh)

  if (isClient && args.generateNavmesh === true) {
    const navigationRaycastTarget = new Group()
    navigationRaycastTarget.scale.setScalar(getComponent(entity, TransformComponent).scale.x)
    Engine.scene.add(navigationRaycastTarget)
    addComponent(entity, NavMeshComponent, {
      navTarget: navigationRaycastTarget
    })
  }

  return mesh
}
