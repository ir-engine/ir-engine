import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { Mesh, Object3D, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { BoxColliderProps } from '../../interfaces/BoxColliderProps'

export const SCENE_COMPONENT_BOX_COLLIDER = 'box-collider'
export const SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES = {
  isTrigger: false,
  removeMesh: false,
  collisionLayer: CollisionGroups.Default,
  collisionMask: DefaultCollisionMask
}

export const deserializeBoxCollider: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<BoxColliderProps>
): void => {
  const boxColliderProps = parseBoxColliderProperties(json.props)
  const transform = getComponent(entity, TransformComponent)
  const colliderDesc = ColliderDesc.cuboid(
    Math.abs(transform.scale.x),
    Math.abs(transform.scale.y),
    Math.abs(transform.scale.z)
  )
  Physics.applyDescToCollider(colliderDesc, { type: 0, ...boxColliderProps }, new Vector3(), new Quaternion())

  const bodyDesc = RigidBodyDesc.fixed()
  Physics.createRigidBody(entity, Engine.instance.currentWorld.physicsWorld, bodyDesc, [colliderDesc])

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_BOX_COLLIDER)

  if (!hasComponent(entity, Object3DComponent)) addComponent(entity, Object3DComponent, { value: new Object3D() })
  const obj3d = getComponent(entity, Object3DComponent).value
  const meshObjs: Object3D[] = []
  obj3d.traverse((mesh: Mesh) => {
    if (typeof mesh.userData['type'] === 'string') meshObjs.push(mesh)
  })

  meshObjs.forEach((mesh) => mesh.removeFromParent())
}

export const updateBoxCollider: ComponentUpdateFunction = (entity: Entity) => {
  const data = serializeBoxCollider(entity) as any
  const boxColliderProps = parseBoxColliderProperties(data.props)

  const rigidbody = getComponent(entity, RigidBodyComponent).body
  const transform = getComponent(entity, TransformComponent)

  const colliderDesc = ColliderDesc.cuboid(
    Math.abs(transform.scale.x),
    Math.abs(transform.scale.y),
    Math.abs(transform.scale.z)
  )
  Physics.applyDescToCollider(colliderDesc, { type: 0, ...boxColliderProps }, transform.position, transform.rotation)
  Engine.instance.currentWorld.physicsWorld.removeCollider(rigidbody.collider(0), true)
  Engine.instance.currentWorld.physicsWorld.createCollider(colliderDesc, rigidbody)
}

export const serializeBoxCollider: ComponentSerializeFunction = (entity) => {
  const rigidbodyComponent = getComponent(entity, RigidBodyComponent)?.body
  if (!rigidbodyComponent) return
  const isTrigger = rigidbodyComponent.collider(0).isSensor()

  return {
    name: SCENE_COMPONENT_BOX_COLLIDER,
    props: {
      isTrigger
      // TODO: these are only used for deserialization for gltf metadata support
      // removeMesh: boolean | 'true' | 'false'
      // collisionLayer: string | number
      // collisionMask: string | number
    }
  }
}

export const parseBoxColliderProperties = (props): BoxColliderProps => {
  return {
    isTrigger: props.isTrigger ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.isTrigger,
    removeMesh: props.removeMesh ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.removeMesh,
    collisionLayer: props.collisionLayer ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.collisionLayer,
    collisionMask: props.collisionMask ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.collisionMask
  }
}
