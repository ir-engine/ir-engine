import { ColliderDesc, RigidBodyDesc, RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import {
  ColliderComponent,
  ColliderComponentType,
  SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES
} from '../../components/ColliderComponent'

export const deserializeCollider: ComponentDeserializeFunction = (
  entity: Entity,
  data: ColliderComponentType
): void => {
  // todo: ColliderComponent needs to be refactored to support multiple colliders
  const colliderProps = parseColliderProperties(data)
  setComponent(entity, ColliderComponent, colliderProps)
}

export const updateCollider = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  const colliderComponent = getOptionalComponent(entity, ColliderComponent)

  if (!colliderComponent) return

  const rigidbodyTypeChanged =
    !hasComponent(entity, RigidBodyComponent) ||
    colliderComponent.bodyType !== getComponent(entity, RigidBodyComponent).body.bodyType()

  const world = Engine.instance.currentWorld

  if (rigidbodyTypeChanged) {
    const rigidbody = getOptionalComponent(entity, RigidBodyComponent)?.body
    /**
     * If rigidbody exists, simply change it's type
     */
    if (rigidbody) {
      Physics.changeRigidbodyType(entity, colliderComponent.bodyType)
    } else {
      /**
       * If rigidbody does not exist, create one
       */
      let bodyDesc: RigidBodyDesc
      switch (colliderComponent.bodyType) {
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

  const rigidbody = getComponent(entity, RigidBodyComponent)

  /**
   * This component only supports one collider, always at index 0
   */
  Physics.removeCollidersFromRigidBody(entity, world.physicsWorld)
  const colliderDesc = createColliderDescFromScale(colliderComponent.shapeType, transform.scale)
  Physics.applyDescToCollider(
    colliderDesc,
    {
      shapeType: colliderComponent.shapeType,
      isTrigger: colliderComponent.isTrigger,
      /** @todo for whatever reason, the character controller will still collide with triggers if they have a collision layer other than trigger  */
      collisionLayer: colliderComponent.isTrigger ? CollisionGroups.Trigger : colliderComponent.collisionLayer,
      collisionMask: colliderComponent.collisionMask,
      restitution: colliderComponent.restitution,
      removeMesh: colliderComponent.removeMesh
    },
    new Vector3(),
    new Quaternion()
  )
  world.physicsWorld.createCollider(colliderDesc, rigidbody.body)

  rigidbody.body.setTranslation(transform.position, true)
  rigidbody.body.setRotation(transform.rotation, true)
  rigidbody.scale.copy(transform.scale)
}

export const updateModelColliders = (entity: Entity) => {
  const colliderComponent = getComponent(entity, ColliderComponent)

  if (hasComponent(entity, RigidBodyComponent)) {
    Physics.removeRigidBody(entity, Engine.instance.currentWorld.physicsWorld)
  }

  Physics.createRigidBodyForGroup(entity, Engine.instance.currentWorld.physicsWorld, {
    bodyType: colliderComponent.bodyType,
    isTrigger: colliderComponent.isTrigger,
    removeMesh: colliderComponent.removeMesh,
    collisionLayer: colliderComponent.collisionLayer,
    collisionMask: colliderComponent.collisionMask,
    restitution: colliderComponent.restitution
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
    bodyType: collider.bodyType,
    shapeType: collider.shapeType,
    isTrigger: collider.isTrigger,
    removeMesh: collider.removeMesh,
    collisionLayer: collider.collisionLayer,
    collisionMask: collider.collisionMask,
    restitution: collider.restitution
  } as ColliderComponentType
  if (collider.isTrigger) {
    response.onEnter = collider.onEnter
    response.onExit = collider.onExit
    response.target = collider.target
  }
  return response
}

export const parseColliderProperties = (props: Partial<ColliderComponentType>): ColliderComponentType => {
  const response = {
    bodyType: props.bodyType ?? SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES.bodyType,
    shapeType: props.shapeType ?? SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES.shapeType,
    isTrigger: props.isTrigger ?? SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES.isTrigger,
    removeMesh: props.removeMesh ?? SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES.removeMesh,
    collisionLayer: props.collisionLayer ?? SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES.collisionLayer,
    collisionMask: props.collisionMask ?? SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES.collisionMask,
    restitution: props.restitution ?? SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES.restitution
  } as ColliderComponentType
  if (response.isTrigger) {
    response.onEnter = props.onEnter
    response.onExit = props.onExit
    response.target = props.target
  }
  return response
}
