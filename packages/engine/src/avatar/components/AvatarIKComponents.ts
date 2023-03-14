import { useEffect } from 'react'
import { Bone, Object3D, Vector3 } from 'three'

import { isClient } from '../../common/functions/isClient'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  hasComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { PoseSchema, QuaternionSchema, Vector3Schema } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

const EPSILON = 1e-6

export const AvatarHeadDecapComponent = defineComponent({
  name: 'AvatarHeadDecapComponent',

  reactor: function ({ root }) {
    const entity = root.entity

    const headDecap = useOptionalComponent(entity, AvatarHeadDecapComponent)
    const rig = useOptionalComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (rig?.value) {
        if (headDecap?.value) rig.value.rig.Head?.scale.setScalar(EPSILON)
        return () => {
          rig.value.rig.Head?.scale.setScalar(1)
        }
      }
    }, [headDecap, rig])

    return null
  }
})

export type AvatarHeadIKComponentType = {
  target: Object3D
  /**
   * Clamp the angle between bone forward vector and camera forward in radians
   * Use 0 to disable
   */
  rotationClamp: number
}

const XRHeadIKSchema = {
  target: PoseSchema
}

export const AvatarHeadIKComponent = defineComponent({
  name: 'AvatarHeadIKComponent',
  schema: XRHeadIKSchema,

  onInit(entity) {
    return {
      target: new Object3D(),
      rotationClamp: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.target) component.target.set(json.target as Object3D)
    if (json.rotationClamp) component.rotationClamp.set(json.rotationClamp)
  }
})

/**
 * Avatar Hands IK Solver Component.
 */
export type AvatarHandsIKComponentType = {
  target: Object3D
  hint: Object3D
  targetOffset: Object3D
  targetPosWeight: number
  targetRotWeight: number
  hintWeight: number
}

const HandIKSchema = {
  target: PoseSchema
}

const _vec = new Vector3()

export const AvatarLeftArmIKComponent = defineComponent({
  name: 'AvatarLeftArmIKComponent',

  schema: HandIKSchema,

  onInit(entity) {
    const leftHint = new Object3D()
    leftHint.name = `ik-left-hint-${entity}`
    const leftOffset = new Object3D()
    leftOffset.name = `ik-left-offset-${entity}`

    const rig = getComponent(entity, AvatarRigComponent)

    leftOffset.rotation.set(-Math.PI * 0.5, Math.PI, 0)

    if (isClient) {
      rig.rig.LeftShoulder.getWorldPosition(leftHint.position)
      rig.rig.LeftArm.getWorldPosition(_vec)
      _vec.subVectors(_vec, leftHint.position).normalize()
      leftHint.position.add(_vec)
      rig.rig.LeftShoulder.attach(leftHint)
      leftHint.updateMatrixWorld(true)
    }

    const target = new Object3D()
    target.name = `ik-right-target-${entity}`

    proxifyVector3(AvatarLeftArmIKComponent.target.position, entity, target.position)
    proxifyQuaternion(AvatarLeftArmIKComponent.target.rotation, entity, target.quaternion)

    return {
      target,
      hint: leftHint,
      targetOffset: leftOffset,
      targetPosWeight: 1,
      targetRotWeight: 1,
      hintWeight: 1
    }
  },

  onRemove(entity, world) {
    const leftHand = getComponent(entity, AvatarLeftArmIKComponent)
    leftHand?.hint?.removeFromParent()
  }
})

export const AvatarRightArmIKComponent = defineComponent({
  name: 'AvatarLeftArmIKComponent',
  schema: HandIKSchema,
  onInit(entity) {
    const rightHint = new Object3D()
    rightHint.name = `ik-right-hint-${entity}`
    const rightOffset = new Object3D()
    rightOffset.name = `ik-right-offset-${entity}`

    const rig = getComponent(entity, AvatarRigComponent)

    rightOffset.rotation.set(-Math.PI * 0.5, 0, 0)
    rightOffset.updateMatrix()
    rightOffset.updateMatrixWorld(true)

    if (isClient) {
      rig.rig.RightShoulder.getWorldPosition(rightHint.position)
      rig.rig.RightArm.getWorldPosition(_vec)
      _vec.subVectors(_vec, rightHint.position).normalize()
      rightHint.position.add(_vec)
      rig.rig.RightShoulder.attach(rightHint)
      rightHint.updateMatrixWorld(true)
    }

    const target = new Object3D()
    target.name = `ik-right-target-${entity}`

    proxifyVector3(AvatarRightArmIKComponent.target.position, entity, target.position)
    proxifyQuaternion(AvatarRightArmIKComponent.target.rotation, entity, target.quaternion)

    return {
      target,
      hint: rightHint,
      targetOffset: rightOffset,
      targetPosWeight: 1,
      targetRotWeight: 1,
      hintWeight: 1
    }
  },

  onRemove(entity, world) {
    const rightHand = getComponent(entity, AvatarRightArmIKComponent)
    rightHand?.hint?.removeFromParent()
  }
})

export type AvatarIKTargetsType = {
  head: boolean
  leftHand: boolean
  rightHand: boolean
}

export const AvatarIKTargetsComponent = defineComponent({
  name: 'AvatarIKTargetsComponent',

  onInit(entity) {
    return {
      head: false,
      leftHand: false,
      rightHand: false
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.head === 'boolean') component.head.set(json.head)
    if (typeof json.leftHand === 'boolean') component.leftHand.set(json.leftHand)
    if (typeof json.rightHand === 'boolean') component.rightHand.set(json.rightHand)
  }
})

/**
 * Gets the hand position in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */
export const getHandTarget = (entity: Entity, hand: XRHandedness): Object3D | null => {
  switch (hand) {
    case 'left':
      if (hasComponent(entity, AvatarLeftArmIKComponent))
        return getComponent(entity, AvatarLeftArmIKComponent).target as Object3D
      if (hasComponent(entity, AvatarRigComponent)) return getComponent(entity, AvatarRigComponent).rig.LeftHand as Bone
      break
    case 'right':
      if (hasComponent(entity, AvatarRightArmIKComponent))
        return getComponent(entity, AvatarRightArmIKComponent).target as Object3D
      if (hasComponent(entity, AvatarRigComponent))
        return getComponent(entity, AvatarRigComponent).rig.RightHand as Bone
      break
    case 'none':
      if (hasComponent(entity, AvatarHeadIKComponent))
        return getComponent(entity, AvatarHeadIKComponent).target as Object3D
      if (hasComponent(entity, AvatarRigComponent)) return getComponent(entity, AvatarRigComponent).rig.Head as Bone
      break
  }
  return null
}
