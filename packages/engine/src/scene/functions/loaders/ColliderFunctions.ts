import { ColliderDesc, RigidBodyDesc, RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { ComponentType } from 'bitecs'
import { Quaternion, Vector3 } from 'three'
import { State } from 'yuka'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  Component,
  getComponent,
  hasComponent,
  serializeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { ColliderComponent } from '../../components/ColliderComponent'
import { NameComponent } from '../../components/NameComponent'

export const deserializeCollider: ComponentDeserializeFunction = (
  entity: Entity,
  data: ReturnType<typeof ColliderComponent.toJSON>
): void => {
  setComponent(entity, ColliderComponent, data)
}

//TODO: Add support for animations updating collider transform
export const updateCollider = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  const colliderComponent = getComponent(entity, ColliderComponent)
  const world = Engine.instance.currentWorld
  if (!colliderComponent) return
  const rigidbodyTypeChanged =
    !hasComponent(entity, RigidBodyComponent) ||
    colliderComponent.bodyType.value !== getComponent(entity, RigidBodyComponent).body.bodyType()

  if (rigidbodyTypeChanged) {
    const rigidbody = getComponent(entity, RigidBodyComponent)?.body
    /**
     * If rigidbody exists, simply change it's type
     */
    if (rigidbody) {
      Physics.changeRigidbodyType(entity, colliderComponent.bodyType.value)
    } else {
      /**
       * If rigidbody does not exist, create one
       * note: this adds a VelocityComponent
       */
      let bodyDesc: RigidBodyDesc
      switch (colliderComponent.bodyType.value) {
        case RigidBodyType.Dynamic:
          bodyDesc = RigidBodyDesc.dynamic()
          break
        case RigidBodyType.KinematicPositionBased:
          bodyDesc = RigidBodyDesc.kinematicPositionBased()
          break
        case RigidBodyType.KinematicVelocityBased:
          bodyDesc = RigidBodyDesc.kinematicVelocityBased()
          break
        default:
        case RigidBodyType.Fixed:
          bodyDesc = RigidBodyDesc.fixed()
          break
      }
      Physics.createRigidBody(entity, world.physicsWorld, bodyDesc, [])
    }
  }

  const rigidbody = getComponent(entity, RigidBodyComponent).body

  /**
   * This component only supports one collider, always at index 0
   */
  Physics.removeCollidersFromRigidBody(entity, world.physicsWorld)
  const scale = new Vector3().copy(transform.scale).multiply(colliderComponent.scaleMultiplier.value)
  const colliderDesc = createColliderDescFromScale(colliderComponent.shapeType.value, scale)
  Physics.applyDescToCollider(
    colliderDesc,
    {
      shapeType: colliderComponent.shapeType.value,
      size: scale,
      isTrigger: colliderComponent.triggerCount.value > 0,
      collisionLayer: colliderComponent.collisionLayer.value,
      collisionMask: colliderComponent.collisionMask.value
    },

    new Vector3(),
    new Quaternion()
  )
  world.physicsWorld.createCollider(colliderDesc, rigidbody)

  rigidbody.setTranslation(transform.position, true)
  rigidbody.setRotation(transform.rotation, true)
}

export const updateModelColliders = (entity: Entity) => {
  const colliderComponent = getComponent(entity, ColliderComponent)
  if (hasComponent(entity, RigidBodyComponent)) {
    Physics.removeRigidBody(entity, Engine.instance.currentWorld.physicsWorld)
  }

  Physics.createRigidBodyForGroup(entity, Engine.instance.currentWorld.physicsWorld, {
    bodyType: colliderComponent.bodyType.value,
    shapeType: colliderComponent.shapeType.value,
    size: colliderComponent.scaleMultiplier.value,
    isTrigger: colliderComponent.triggerCount.value > 0,
    removeMesh: colliderComponent.removeMesh.value,
    collisionLayer: colliderComponent.collisionLayer.value,
    collisionMask: colliderComponent.collisionMask.value
  })
}

/**
 * A lot of rapier's colliders don't make sense in this context, so create a list of simple primitives to allow
 */
export const supportedColliderShapes = [ShapeType.Cuboid, ShapeType.Ball, ShapeType.Capsule, ShapeType.Cylinder]

export const createColliderDescFromScale = (shapeType: ShapeType, scale: Vector3) => {
  switch (shapeType as ShapeType) {
    default:
    case ShapeType.Cuboid:
      return ColliderDesc.cuboid(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z))
    case ShapeType.Ball:
      return ColliderDesc.ball(Math.abs(scale.x))
    case ShapeType.Capsule:
      return ColliderDesc.capsule(Math.abs(scale.y), Math.abs(scale.x))
    case ShapeType.Cylinder:
      return ColliderDesc.cylinder(Math.abs(scale.y), Math.abs(scale.x))
  }
}

export const serializeCollider: ComponentSerializeFunction = (entity) => {
  const collider = getComponent(entity, ColliderComponent)
  const response = {
    bodyType: collider.bodyType.value,
    shapeType: collider.shapeType.value,
    scaleMultiplier: collider.scaleMultiplier.value,
    triggerCount: collider.triggerCount.value,
    removeMesh: collider.removeMesh.value,
    collisionLayer: collider.collisionLayer.value,
    collisionMask: collider.collisionMask.value
  } as any
  if (collider.triggerCount.value > 0) {
    response.onEnter = collider.onEnter.value
    response.onExit = collider.onExit.value
    response.target = collider.target.value
  }
  return response
}
