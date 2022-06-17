import { Mesh, Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { isTriggerShape, setTriggerShape } from '../../../physics/classes/Physics'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { createBody } from '../../../physics/functions/createCollider'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { BoxColliderProps } from '../../interfaces/BoxColliderProps'

export const SCENE_COMPONENT_BOX_COLLIDER = 'box-collider'
export const SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES = {
  isTrigger: false,
  removeMesh: false,
  collisionLayer: DefaultCollisionMask,
  collisionMask: CollisionGroups.Default
}

export const deserializeBoxCollider: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<BoxColliderProps>
): void => {
  const world = useWorld()
  const boxColliderProps = parseBoxColliderProperties(json.props)
  const transform = getComponent(entity, TransformComponent)

  const shape = world.physics.createShape(
    new PhysX.PxBoxGeometry(Math.abs(transform.scale.x), Math.abs(transform.scale.y), Math.abs(transform.scale.z)),
    undefined,
    boxColliderProps as any
  )

  const body = createBody(entity, { bodyType: 0 }, [shape])
  addComponent(entity, ColliderComponent, { body })
  addComponent(entity, CollisionComponent, { collisions: [] })

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_BOX_COLLIDER)

  if (!hasComponent(entity, Object3DComponent)) addComponent(entity, Object3DComponent, { value: new Object3D() })
  const obj3d = getComponent(entity, Object3DComponent).value
  const meshObjs: Object3D[] = []
  obj3d.traverse((mesh: Mesh) => {
    if (typeof mesh.userData['type'] === 'string') meshObjs.push(mesh)
  })

  meshObjs.forEach((mesh) => mesh.removeFromParent())
}

export const updateScaleTransform = function (entity: Entity) {
  //Todo: getting box collider props
  const data = serializeBoxCollider(entity) as any
  const boxColliderProps = parseBoxColliderProperties(data.props)

  const component = getComponent(entity, ColliderComponent)
  const transform = getComponent(entity, TransformComponent)
  const shape = Engine.instance.currentWorld.physics.createShape(
    new PhysX.PxBoxGeometry(Math.abs(transform.scale.x), Math.abs(transform.scale.y), Math.abs(transform.scale.z)),
    undefined,
    boxColliderProps as any
  )

  Engine.instance.currentWorld.physics.removeBody(component.body)
  component.body = createBody(entity, { bodyType: 0 }, [shape])
}

export const updateBoxCollider: ComponentUpdateFunction = (entity: Entity, props: BoxColliderProps) => {
  const component = getComponent(entity, ColliderComponent)
  const transform = getComponent(entity, TransformComponent)

  const pose = component.body.getGlobalPose()
  pose.translation = transform.position
  pose.rotation = transform.rotation
  component.body.setGlobalPose(pose, false)
  component.body._debugNeedsUpdate = true

  const world = useWorld()
  const boxShape = world.physics.getRigidbodyShapes(component.body)[0]
  setTriggerShape(boxShape, props.isTrigger)
  boxShape._debugNeedsUpdate = true
}

export const serializeBoxCollider: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ColliderComponent)
  if (!component) return
  const world = useWorld()

  const boxShape = world.physics.getRigidbodyShapes(component.body)[0]
  const isTrigger = isTriggerShape(boxShape)

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
