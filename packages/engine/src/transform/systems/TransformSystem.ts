import { Euler } from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { CopyTransformComponent } from '../components/CopyTransformComponent'
import { DesiredTransformComponent } from '../components/DesiredTransformComponent'
import { TransformChildComponent } from '../components/TransformChildComponent'
import { TransformComponent } from '../components/TransformComponent'
import { TransformParentComponent } from '../components/TransformParentComponent'
import { TweenComponent } from '../components/TweenComponent'

const euler1YXZ = new Euler()
euler1YXZ.order = 'YXZ'
const euler2YXZ = new Euler()
euler2YXZ.order = 'YXZ'

export default async function TransformSystem(world: World): Promise<System> {
  const parentQuery = defineQuery([TransformParentComponent, TransformComponent])
  const childQuery = defineQuery([TransformChildComponent, TransformComponent])
  const copyTransformQuery = defineQuery([CopyTransformComponent])
  const desiredTransformQuery = defineQuery([DesiredTransformComponent])
  const tweenQuery = defineQuery([TweenComponent])
  const transformObjectQuery = defineQuery([TransformComponent, Object3DComponent])

  return () => {
    const { fixedDelta } = world
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

    for (const entity of desiredTransformQuery(world)) {
      const desiredTransform = getComponent(entity, DesiredTransformComponent)

      const mutableTransform = getComponent(entity, TransformComponent)
      mutableTransform.position.lerp(desiredTransform.position, desiredTransform.positionRate * fixedDelta)

      // store rotation before interpolation
      euler1YXZ.setFromQuaternion(mutableTransform.rotation)
      // lerp to desired rotation

      mutableTransform.rotation.slerp(desiredTransform.rotation, desiredTransform.rotationRate * fixedDelta)
      euler2YXZ.setFromQuaternion(mutableTransform.rotation)
      // use axis locks - yes this is correct, the axis order is weird because quaternions
      if (desiredTransform.lockRotationAxis[0]) {
        euler2YXZ.x = euler1YXZ.x
      }
      if (desiredTransform.lockRotationAxis[2]) {
        euler2YXZ.y = euler1YXZ.y
      }
      if (desiredTransform.lockRotationAxis[1]) {
        euler2YXZ.z = euler1YXZ.z
      }
      mutableTransform.rotation.setFromEuler(euler2YXZ)
    }

    for (const entity of tweenQuery(world)) {
      const tween = getComponent(entity, TweenComponent)
      tween.tween.update()
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
  }
}
