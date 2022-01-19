import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { createBody } from '../../../physics/functions/createCollider'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'
import { BoxColliderProps } from '../../interfaces/BoxColliderProps'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { Object3D, Quaternion, Vector3 } from 'three'
import { isTriggerShape, setTriggerShape } from '../../../physics/classes/Physics'

const position = new Vector3()
const scale = new Vector3()
const rotation = new Quaternion()

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
    new PhysX.PxBoxGeometry(transform.scale.x, transform.scale.y, transform.scale.z),
    undefined,
    boxColliderProps as any
  )

  const body = createBody(entity, { bodyType: 0 }, [shape])
  addComponent(entity, ColliderComponent, { body })
  addComponent(entity, CollisionComponent, { collisions: [] })

  if (Engine.isEditor) {
    if (!hasComponent(entity, Object3DComponent)) addComponent(entity, Object3DComponent, { value: new Object3D() })
  } else {
    if (
      boxColliderProps.removeMesh === 'true' ||
      (typeof boxColliderProps.removeMesh === 'boolean' && boxColliderProps.removeMesh === true)
    ) {
      const obj = getComponent(entity, Object3DComponent)
      if (obj?.value) {
        if (obj.value.parent) obj.value.removeFromParent()
        removeComponent(entity, Object3DComponent)
      }
    }
  }
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_BOX_COLLIDER)

  updateBoxCollider(entity, boxColliderProps)
}

export const updateBoxCollider: ComponentUpdateFunction = (entity: Entity, props: BoxColliderProps) => {
  const component = getComponent(entity, ColliderComponent)
  const obj3d = getComponent(entity, Object3DComponent)?.value

  obj3d.matrixWorld.decompose(position, rotation, scale)
  const pose = component.body.getGlobalPose()

  pose.translation.x = position.x
  pose.translation.y = position.y
  pose.translation.z = position.z

  pose.rotation.x = rotation.x
  pose.rotation.y = rotation.y
  pose.rotation.z = rotation.z
  pose.rotation.w = rotation.w

  component.body.setGlobalPose(pose, true)

  const boxShape = useWorld().physics.getRigidbodyShapes(component.body)[0]
  setTriggerShape(boxShape, props.isTrigger)
  component.body._debugNeedsUpdate = true
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

const parseBoxColliderProperties = (props): BoxColliderProps => {
  return {
    isTrigger: props.isTrigger ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.isTrigger,
    removeMesh: props.removeMesh ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.removeMesh,
    collisionLayer: props.collisionLayer ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.collisionLayer,
    collisionMask: props.collisionMask ?? SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES.collisionMask
  }
}
