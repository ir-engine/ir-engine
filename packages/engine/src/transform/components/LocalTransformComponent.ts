import { Matrix4, Quaternion, Vector3 } from 'three'

import { proxifyQuaternionWithDirty, proxifyVector3WithDirty } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponentType, TransformSchema } from './TransformComponent'

type LocalTransformComponentType = TransformComponentType & { parentEntity: Entity }

export const LocalTransformComponent = createMappedComponent<LocalTransformComponentType, typeof TransformSchema>(
  'LocalTransformComponent',
  TransformSchema
)

export function setLocalTransformComponent(
  entity: Entity,
  parentEntity: Entity,
  position = new Vector3(),
  rotation = new Quaternion(),
  scale = new Vector3(1, 1, 1)
) {
  const dirtyTransforms = Engine.instance.currentWorld.dirtyTransforms
  return setComponent(entity, LocalTransformComponent, {
    parentEntity,
    // clone incoming transform properties, because we don't want to accidentally bind obj properties to local transform
    position: proxifyVector3WithDirty(LocalTransformComponent.position, entity, dirtyTransforms, position.clone()),
    rotation: proxifyQuaternionWithDirty(LocalTransformComponent.rotation, entity, dirtyTransforms, rotation.clone()),
    scale: proxifyVector3WithDirty(LocalTransformComponent.scale, entity, dirtyTransforms, scale.clone()),
    matrix: new Matrix4()
  })
}
