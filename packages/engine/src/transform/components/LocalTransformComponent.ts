import { Matrix4, Quaternion, Vector3 } from 'three'

import { createQuaternionProxy, createVector3Proxy } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent, TransformComponentType, TransformSchema } from './TransformComponent'

export const LocalTransformComponent = createMappedComponent<TransformComponentType, typeof TransformSchema>(
  'LocalTransformComponent',
  TransformSchema
)

export function setLocalTransformComponent(entity: Entity, position: Vector3, rotation: Quaternion, scale: Vector3) {
  const dirtyTransforms = Engine.instance.currentWorld.dirtyTransforms
  return setComponent(entity, LocalTransformComponent, {
    position: createVector3Proxy(LocalTransformComponent.position, entity, dirtyTransforms).copy(position),
    rotation: createQuaternionProxy(LocalTransformComponent.rotation, entity, dirtyTransforms).copy(rotation),
    scale: createVector3Proxy(LocalTransformComponent.scale, entity, dirtyTransforms).copy(scale)
  })
}

const _scratchMatrixParent = new Matrix4()
const _scratchMatrixChild = new Matrix4()

/**
 * Update local transform based on the difference between the parent and child using matricies
 *   using `parent ^(-1) * child`
 */
export function updateLocalTransformComponentFromParent(parentEntity: Entity, childEntity: Entity) {
  const parentTransformComponent = getComponent(parentEntity, TransformComponent)
  const transformComponent = getComponent(childEntity, TransformComponent)
  const localTransformComponent = getComponent(childEntity, LocalTransformComponent)

  _scratchMatrixParent.compose(
    parentTransformComponent.position,
    parentTransformComponent.rotation,
    parentTransformComponent.scale
  )
  _scratchMatrixParent.invert()

  _scratchMatrixChild.compose(transformComponent.position, transformComponent.rotation, transformComponent.scale)
  _scratchMatrixParent.multiply(_scratchMatrixChild)

  _scratchMatrixParent.decompose(
    localTransformComponent.position,
    localTransformComponent.rotation,
    localTransformComponent.scale
  )
}
