import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { createBody } from '../../../physics/functions/createCollider'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'
import { BoxColliderProps } from '../../interfaces/BoxColliderProps'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../../physics/enums/CollisionGroups'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { Object3D } from 'three'
import { isTriggerShape, setTriggerShape } from '../../../physics/classes/Physics'

export const SCENE_COMPONENT_BOX_COLLIDER = 'box-collider'
export const SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES = {
  isTrigger: false
}

export const deserializeBoxCollider: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<BoxColliderProps>
): void => {
  const world = useWorld()
  const boxColliderProps = json.props
  const transform = getComponent(entity, TransformComponent)

  const shape = world.physics.createShape(
    new PhysX.PxBoxGeometry(transform.scale.x, transform.scale.y, transform.scale.z),
    undefined,
    {
      ...(boxColliderProps as any),
      collisionLayer: DefaultCollisionMask,
      collisionMask: CollisionGroups.Default
    }
  )

  const body = createBody(entity, { bodyType: 0 }, [shape])
  console.log('body', body)
  addComponent(entity, ColliderComponent, { body })
  addComponent(entity, CollisionComponent, { collisions: [] })

  if (Engine.isEditor) {
    addComponent(entity, Object3DComponent, { value: new Object3D() })
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
}

export const updateBoxCollider: ComponentUpdateFunction = (entity: Entity, props: any) => {
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
