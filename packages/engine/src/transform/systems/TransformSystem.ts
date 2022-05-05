import { Euler } from 'three'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SpawnPointComponent } from '../../scene/components/SpawnPointComponent'
import { CopyTransformComponent } from '../components/CopyTransformComponent'
import { TransformChildComponent } from '../components/TransformChildComponent'
import { TransformComponent } from '../components/TransformComponent'
import { TransformParentComponent } from '../components/TransformParentComponent'

const parentQuery = defineQuery([TransformParentComponent, TransformComponent])
const childQuery = defineQuery([TransformChildComponent, TransformComponent])
const copyTransformQuery = defineQuery([CopyTransformComponent])
const transformObjectQuery = defineQuery([TransformComponent, Object3DComponent])
const spawnPointQuery = defineQuery([SpawnPointComponent])

export default async function TransformSystem(world: World) {
  return () => {
    for (const entity of parentQuery(world)) {
      const parentTransform = getComponent(entity, TransformComponent)
      const parentingComponent = getComponent(entity, TransformParentComponent)
      for (const child of parentingComponent.children) {
        if (!hasComponent(child, Object3DComponent)) {
          continue
        }
        const {
          value: { position: childPosition, quaternion: childQuaternion }
        } = getComponent(child, Object3DComponent)
        const childTransformComponent = getComponent(child, TransformComponent)
        // reset to "local"
        if (childTransformComponent) {
          childPosition.copy(childTransformComponent.position)
          childQuaternion.copy(childTransformComponent.rotation)
        } else {
          childPosition.setScalar(0)
          childQuaternion.set(0, 0, 0, 0)
        }
        // add parent
        childPosition.add(parentTransform.position)
        childQuaternion.multiply(parentTransform.rotation)
      }
    }

    for (const entity of childQuery(world)) {
      const childComponent = getComponent(entity, TransformChildComponent)
      const parent = childComponent.parent
      const parentTransform = getComponent(parent, TransformComponent)
      const childTransformComponent = getComponent(entity, TransformComponent)
      if (childTransformComponent && parentTransform) {
        childTransformComponent.position.setScalar(0).add(parentTransform.position).add(childComponent.offsetPosition)
        childTransformComponent.rotation
          .set(0, 0, 0, 1)
          .multiply(parentTransform.rotation)
          .multiply(childComponent.offsetQuaternion)
      }
    }

    for (const entity of copyTransformQuery(world)) {
      const inputEntity = getComponent(entity, CopyTransformComponent)?.input
      const outputTransform = getComponent(entity, TransformComponent)
      const inputTransform = getComponent(inputEntity, TransformComponent)

      if (!inputTransform || !outputTransform) {
        // wait for both transforms to appear?
        continue
      }

      outputTransform.position.copy(inputTransform.position)
      outputTransform.rotation.copy(inputTransform.rotation)

      removeComponent(entity, CopyTransformComponent)
    }

    for (const entity of transformObjectQuery(world)) {
      const transform = getComponent(entity, TransformComponent)
      const object3DComponent = getComponent(entity, Object3DComponent)

      if (!object3DComponent.value) {
        console.warn('object3D component on entity', entity, ' is undefined')
        continue
      }

      object3DComponent.value.position.copy(transform.position)
      object3DComponent.value.quaternion.copy(transform.rotation)
      object3DComponent.value.scale.copy(transform.scale)
      if (!hasComponent(entity, AvatarComponent)) object3DComponent.value.updateMatrixWorld()
    }

    if (Engine.instance.isEditor) {
      for (let entity of spawnPointQuery()) {
        const obj3d = getComponent(entity, Object3DComponent)?.value
        if (obj3d) obj3d.userData.helperModel?.scale.set(1 / obj3d.scale.x, 1 / obj3d.scale.y, 1 / obj3d.scale.z)
      }
    }
  }
}
