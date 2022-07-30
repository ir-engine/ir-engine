import { insertionSort } from '@xrengine/common/src/utils/insertionSort'

import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SpawnPointComponent } from '../../scene/components/SpawnPointComponent'
import { TransformOffsetComponent } from '../components/TransformChildComponent'
import { TransformComponent } from '../components/TransformComponent'

const transformOffsetQuery = defineQuery([TransformOffsetComponent, TransformComponent])
const transformObjectQuery = defineQuery([TransformComponent, Object3DComponent])
const spawnPointQuery = defineQuery([SpawnPointComponent])

const updateOffsetDepth = (entity: Entity) => {
  const offset = getComponent(entity, TransformOffsetComponent)
  let depth = 0
  let reference = offset.referenceEntity
  while (reference) {
    depth++
    reference = getComponent(reference, TransformOffsetComponent)?.referenceEntity
  }
  offset.depth = depth
}

const compareChildDepth = (a: Entity, b: Entity) => {
  const aTransform = getComponent(a, TransformOffsetComponent)
  const bTransform = getComponent(b, TransformOffsetComponent)
  return aTransform.depth - bTransform.depth
}

export default async function TransformSystem(world: World) {
  return () => {
    const offsetTransformEntities = transformOffsetQuery(world)

    for (const entity of offsetTransformEntities) updateOffsetDepth(entity)

    // Insertion sort is O(n) for mostly sorted arrays
    insertionSort(offsetTransformEntities, compareChildDepth)

    for (const entity of offsetTransformEntities) {
      const offset = getComponent(entity, TransformOffsetComponent)
      const transform = getComponent(entity, TransformComponent)
      const referenceTransform = getComponent(offset.referenceEntity, TransformComponent)
      if (transform && referenceTransform) {
        transform.position
          .copy(offset.offsetPosition)
          .applyQuaternion(referenceTransform.rotation)
          .add(referenceTransform.position)
        transform.rotation.copy(referenceTransform.rotation).multiply(offset.offsetRotation)
      }
    }

    for (const entity of transformObjectQuery.enter()) {
      const transform = getComponent(entity, TransformComponent)
      const object3D = getComponent(entity, Object3DComponent).value
      if (transform && object3D) {
        object3D.position.copy(transform.position)
        object3D.quaternion.copy(transform.rotation)
        object3D.scale.copy(transform.scale)
        proxifyVector3(TransformComponent.position, entity, object3D.position)
        proxifyQuaternion(TransformComponent.rotation, entity, object3D.quaternion)
        proxifyVector3(TransformComponent.scale, entity, object3D.scale)
      }
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

      // replace scale 0 with epsilon to prevent NaN
      if (transform.scale.x === 0) object3DComponent.value.scale.x = 1 - 1e-10
      if (transform.scale.y === 0) object3DComponent.value.scale.y = 1 - 1e-10
      if (transform.scale.z === 0) object3DComponent.value.scale.z = 1 - 1e-10

      if (Engine.instance.isEditor) {
        for (let entity of spawnPointQuery()) {
          const obj3d = getComponent(entity, Object3DComponent)?.value
          if (obj3d) obj3d.userData.helperModel?.scale.set(1 / obj3d.scale.x, 1 / obj3d.scale.y, 1 / obj3d.scale.z)
        }
      }
    }
  }
}
