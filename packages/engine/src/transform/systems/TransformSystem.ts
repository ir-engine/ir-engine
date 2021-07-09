import { Euler, Quaternion } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { getComponent, getMutableComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { CopyTransformComponent } from '../components/CopyTransformComponent'
import { DesiredTransformComponent } from '../components/DesiredTransformComponent'
import { TransformChildComponent } from '../components/TransformChildComponent'
import { TransformComponent } from '../components/TransformComponent'
import { TransformParentComponent } from '../components/TransformParentComponent'

const MAX_IGNORED_DISTANCE = 0.001
const MAX_IGNORED_ANGLE = 0.001
const euler1YXZ = new Euler()
euler1YXZ.order = 'YXZ'
const euler2YXZ = new Euler()
euler2YXZ.order = 'YXZ'
const quat = new Quaternion()

export class TransformSystem extends System {
  updateType = SystemUpdateType.Fixed

  execute (delta) {
    this.queryResults.parent.all?.forEach(entity => {
      const parentTransform = getMutableComponent(entity, TransformComponent)
      const parentingComponent = getComponent<TransformParentComponent>(entity, TransformParentComponent)
      parentingComponent.children.forEach(child => {
        if (!hasComponent(child, Object3DComponent)) {
          return
        }
        const { value: { position: childPosition, quaternion: childQuaternion } } = getMutableComponent<Object3DComponent>(child, Object3DComponent)
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
      })
    })

    this.queryResults.child.all?.forEach(entity => {
      const childComponent = getComponent(entity, TransformChildComponent)
      const parent = childComponent.parent
      const parentTransform = getMutableComponent(parent, TransformComponent)
      const childTransformComponent = getComponent(entity, TransformComponent)
      if (childTransformComponent && parentTransform) {
        childTransformComponent.position.setScalar(0).add(parentTransform.position).add(childComponent.offsetPosition)
        childTransformComponent.rotation.set(0, 0, 0, 1).multiply(parentTransform.rotation).multiply(childComponent.offsetQuaternion)
      }
    })

    this.queryResults.copyTransform.all?.forEach(entity => {
      const inputEntity = getMutableComponent(entity, CopyTransformComponent)?.input
      const outputTransform = getMutableComponent(entity, TransformComponent)
      const inputTransform = getComponent(inputEntity, TransformComponent)

      if (!inputTransform || !outputTransform) {
        // wait for both transforms to appear?
        return
      }

      outputTransform.position.copy(inputTransform.position)
      outputTransform.rotation.copy(inputTransform.rotation)
      outputTransform.velocity.copy(inputTransform.velocity)

      removeComponent(entity, CopyTransformComponent)
    })

    this.queryResults.desiredTransforms.all?.forEach(entity => {
      const transform = getComponent(entity, TransformComponent)
      const desiredTransform = getComponent(entity, DesiredTransformComponent)

      const positionIsSame = desiredTransform.position === null || transform.position.equals(desiredTransform.position)
      const rotationIsSame = desiredTransform.rotation === null || transform.rotation.equals(desiredTransform.rotation)

      if (positionIsSame && rotationIsSame) {
        return
      }

      if (!positionIsSame) {
        const mutableTransform = getMutableComponent(entity, TransformComponent)
        if (transform.position.distanceTo(desiredTransform.position) <= MAX_IGNORED_DISTANCE) {
          // position is too near, no need to move closer - just copy it
          mutableTransform.position.copy(desiredTransform.position)
        } else {
          // move to desired position
          // TODO: move to desired position
          // TODO: store alpha in DesiredTransformComponent ?
          // TODO: use speed instead of lerp?
          mutableTransform.position.lerp(desiredTransform.position, desiredTransform.positionRate * delta)
        }
      }

      if (!rotationIsSame) {
        const mutableTransform = getMutableComponent(entity, TransformComponent)
        if (transform.rotation.angleTo(desiredTransform.rotation) <= MAX_IGNORED_ANGLE) {
          // value is close enough, just copy it
          mutableTransform.rotation.copy(desiredTransform.rotation)
        } else {
          // store rotation before interpolation
          euler1YXZ.setFromQuaternion(mutableTransform.rotation)
          // lerp to desired rotation
          // TODO: lerp to desired rotation
          // TODO: store alpha in DesiredTransformComponent ?
          mutableTransform.rotation.slerp(desiredTransform.rotation, desiredTransform.rotationRate * delta)
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
      }
    })

    this.queryResults.transforms.all?.forEach(entity => {
      const transform = getMutableComponent(entity, TransformComponent)

      transform.position.addScaledVector(transform.velocity, delta)

      const object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent)
      if (!object3DComponent) {
        // this breake a
        // removeComponent(entity, TransformComponent);
        return // console.warn("Object is not an object3d", entity.id);
      }

      if (!object3DComponent.value) { return console.warn('object3D component on entity', entity.id, ' is undefined') }

      // if(!object3DComponent.value.position){
      //   return console.warn("object3D has no position");
      // }

      object3DComponent.value.position.copy(transform.position)
      object3DComponent.value.rotation.setFromQuaternion(transform.rotation)
      if (transform.scale && transform.scale.length() > 0) {
        object3DComponent.value.scale.copy(transform.scale)
      }
      object3DComponent.value.updateMatrixWorld()
    })
  }
}

TransformSystem.queries = {
  parent: {
    components: [TransformParentComponent, TransformComponent]
  },
  child: {
    components: [TransformChildComponent, TransformComponent]
  },
  transforms: {
    components: [TransformComponent],
    listen: {
      added: true,
      changed: true
    }
  },
  desiredTransforms: {
    components: [DesiredTransformComponent]
  },
  copyTransform: {
    components: [CopyTransformComponent]
  }
}
