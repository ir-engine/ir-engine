// TODO: this should not be here
import { useEffect } from 'react'

import { BoneStructure } from '../avatar/AvatarBoneMatching'
import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { matches } from '../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../common/proxies/createThreejsProxy'
import { Entity } from '../ecs/classes/Entity'
import { defineComponent, hasComponent, useComponent, useOptionalComponent } from '../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../transform/components/TransformComponent'

/** Maps each XR Joint to it's parent joint */
export const XRJointParentMap = {
  'thumb-metacarpal': 'wrist',
  'thumb-phalanx-proximal': 'thumb-metacarpal',
  'thumb-phalanx-distal': 'thumb-phalanx-proximal',
  'thumb-tip': 'thumb-phalanx-distal',
  'index-finger-metacarpal': 'wrist',
  'index-finger-phalanx-proximal': 'index-finger-metacarpal',
  'index-finger-phalanx-intermediate': 'index-finger-phalanx-proximal',
  'index-finger-phalanx-distal': 'index-finger-phalanx-intermediate',
  'index-finger-tip': 'index-finger-phalanx-distal',
  'middle-finger-metacarpal': 'wrist',
  'middle-finger-phalanx-proximal': 'middle-finger-metacarpal',
  'middle-finger-phalanx-intermediate': 'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-distal': 'middle-finger-phalanx-intermediate',
  'middle-finger-tip': 'middle-finger-phalanx-distal',
  'ring-finger-metacarpal': 'wrist',
  'ring-finger-phalanx-proximal': 'ring-finger-metacarpal',
  'ring-finger-phalanx-intermediate': 'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-distal': 'ring-finger-phalanx-intermediate',
  'ring-finger-tip': 'ring-finger-phalanx-distal',
  'pinky-finger-metacarpal': 'wrist',
  'pinky-finger-phalanx-proximal': 'pinky-finger-metacarpal',
  'pinky-finger-phalanx-intermediate': 'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-distal': 'pinky-finger-phalanx-intermediate',
  'pinky-finger-tip': 'pinky-finger-phalanx-distal'
} as Record<XRHandJoint, XRHandJoint>

const Object3DSchema = {
  position: Vector3Schema,
  quaternion: QuaternionSchema
}

const HandSchema = {
  wrist: Object3DSchema,
  'thumb-metacarpal': Object3DSchema,
  'thumb-phalanx-proximal': Object3DSchema,
  'thumb-phalanx-distal': Object3DSchema,
  'thumb-tip': Object3DSchema,
  'index-finger-metacarpal': Object3DSchema,
  'index-finger-phalanx-proximal': Object3DSchema,
  'index-finger-phalanx-intermediate': Object3DSchema,
  'index-finger-phalanx-distal': Object3DSchema,
  'index-finger-tip': Object3DSchema,
  'middle-finger-metacarpal': Object3DSchema,
  'middle-finger-phalanx-proximal': Object3DSchema,
  'middle-finger-phalanx-intermediate': Object3DSchema,
  'middle-finger-phalanx-distal': Object3DSchema,
  'middle-finger-tip': Object3DSchema,
  'ring-finger-metacarpal': Object3DSchema,
  'ring-finger-phalanx-proximal': Object3DSchema,
  'ring-finger-phalanx-intermediate': Object3DSchema,
  'ring-finger-phalanx-distal': Object3DSchema,
  'ring-finger-tip': Object3DSchema,
  'pinky-finger-metacarpal': Object3DSchema,
  'pinky-finger-phalanx-proximal': Object3DSchema,
  'pinky-finger-phalanx-intermediate': Object3DSchema,
  'pinky-finger-phalanx-distal': Object3DSchema,
  'pinky-finger-tip': Object3DSchema
}

/**
 * Binds each bone on the avatar to the corresponding bone on the component.
 * Starts from the tips and regresses until there we reach the wrist or there are no bones left.
 * @param entity
 * @param handedness
 * @param rig
 * @param component
 */
const proxifyHand = (
  entity: Entity,
  handedness: XRHandedness,
  rig: BoneStructure,
  component: typeof XRLeftHandComponent | typeof XRRightHandComponent
) => {
  const handCapitalCase = handedness.charAt(0).toUpperCase() + handedness.slice(1)

  // proxifyVector3(component.wrist.position, entity, rig[`${handCapitalCase}Hand`].position)
  // proxifyQuaternion(component.wrist.quaternion, entity, rig[`${handCapitalCase}Hand`].quaternion)

  let nextFinger = component['thumb-tip']
  if (rig[`${handCapitalCase}HandThumb4`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandThumb4`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandThumb4`].quaternion)
    nextFinger = component['thumb-phalanx-distal']
  }
  if (rig[`${handCapitalCase}HandThumb3`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandThumb3`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandThumb3`].quaternion)
    nextFinger = component['thumb-phalanx-proximal']
  }
  if (rig[`${handCapitalCase}HandThumb2`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandThumb2`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandThumb2`].quaternion)
    nextFinger = component['thumb-metacarpal']
  }
  if (rig[`${handCapitalCase}HandThumb1`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandThumb1`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandThumb1`].quaternion)
  }
  nextFinger = component['index-finger-tip']
  if (rig[`${handCapitalCase}HandIndexFinger5`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandIndexFinger5`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandIndexFinger5`].quaternion)
    nextFinger = component['index-finger-phalanx-distal']
  }
  if (rig[`${handCapitalCase}HandIndexFinger4`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandIndexFinger4`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandIndexFinger4`].quaternion)
    nextFinger = component['index-finger-phalanx-intermediate']
  }
  if (rig[`${handCapitalCase}HandIndexFinger3`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandIndexFinger3`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandIndexFinger3`].quaternion)
    nextFinger = component['index-finger-phalanx-proximal']
  }
  if (rig[`${handCapitalCase}HandIndexFinger2`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandIndexFinger2`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandIndexFinger2`].quaternion)
    nextFinger = component['index-finger-metacarpal']
  }
  if (rig[`${handCapitalCase}HandIndexFinger1`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandIndexFinger1`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandIndexFinger1`].quaternion)
  }
  nextFinger = component['middle-finger-tip']
  if (rig[`${handCapitalCase}HandMiddleFinger5`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandMiddleFinger5`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandMiddleFinger5`].quaternion)
    nextFinger = component['middle-finger-phalanx-distal']
  }
  if (rig[`${handCapitalCase}HandMiddleFinger4`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandMiddleFinger4`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandMiddleFinger4`].quaternion)
    nextFinger = component['middle-finger-phalanx-intermediate']
  }
  if (rig[`${handCapitalCase}HandMiddleFinger3`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandMiddleFinger3`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandMiddleFinger3`].quaternion)
    nextFinger = component['middle-finger-phalanx-proximal']
  }
  if (rig[`${handCapitalCase}HandMiddleFinger2`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandMiddleFinger2`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandMiddleFinger2`].quaternion)
    nextFinger = component['middle-finger-metacarpal']
  }
  if (rig[`${handCapitalCase}HandMiddleFinger1`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandMiddleFinger1`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandMiddleFinger1`].quaternion)
  }
  nextFinger = component['ring-finger-tip']
  if (rig[`${handCapitalCase}HandRingFinger5`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandRingFinger5`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandRingFinger5`].quaternion)
    nextFinger = component['ring-finger-phalanx-distal']
  }
  if (rig[`${handCapitalCase}HandRingFinger4`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandRingFinger4`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandRingFinger4`].quaternion)
    nextFinger = component['ring-finger-phalanx-intermediate']
  }
  if (rig[`${handCapitalCase}HandRingFinger3`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandRingFinger3`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandRingFinger3`].quaternion)
    nextFinger = component['ring-finger-phalanx-proximal']
  }
  if (rig[`${handCapitalCase}HandRingFinger2`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandRingFinger2`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandRingFinger2`].quaternion)
    nextFinger = component['ring-finger-phalanx-tip']
  }
  if (rig[`${handCapitalCase}HandRingFinger1`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandRingFinger1`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandRingFinger1`].quaternion)
  }
  nextFinger = component['pinky-finger-tip']
  if (rig[`${handCapitalCase}HandPinkyFinger5`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandPinkyFinger5`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandPinkyFinger5`].quaternion)
    nextFinger = component['pinky-finger-phalanx-distal']
  }
  if (rig[`${handCapitalCase}HandPinkyFinger4`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandPinkyFinger4`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandPinkyFinger4`].quaternion)
    nextFinger = component['pinky-finger-phalanx-intermediate']
  }
  if (rig[`${handCapitalCase}HandPinkyFinger3`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandPinkyFinger3`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandPinkyFinger3`].quaternion)
    nextFinger = component['pinky-finger-phalanx-proximal']
  }
  if (rig[`${handCapitalCase}HandPinkyFinger2`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandPinkyFinger2`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandPinkyFinger2`].quaternion)
    nextFinger = component['pinky-finger-phalanx-tip']
  }
  if (rig[`${handCapitalCase}HandPinkyFinger1`]) {
    proxifyVector3(nextFinger.position, entity, rig[`${handCapitalCase}HandPinkyFinger1`].position)
    proxifyQuaternion(nextFinger.quaternion, entity, rig[`${handCapitalCase}HandPinkyFinger1`].quaternion)
  }
}

export const XRLeftHandComponent = defineComponent({
  name: 'XRLeftHandComponent',
  schema: HandSchema,

  onInit: (entity) => {
    return {
      hand: null! as XRHand
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.hand)) component.hand.set(json.hand)
  },

  onRemove: (entity, component) => {},

  reactor: function ({ root }) {
    const entity = root.entity

    if (!hasComponent(entity, XRLeftHandComponent)) throw root.stop()

    const hand = useComponent(entity, XRLeftHandComponent)
    const rig = useOptionalComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (rig?.value) {
        proxifyHand(entity, 'left', rig.value.rig, XRLeftHandComponent)
      }
    }, [hand, rig])

    return null
  }
})

export const XRRightHandComponent = defineComponent({
  name: 'XRRightHandComponent',
  schema: HandSchema,

  onInit: (entity) => {
    return {
      hand: null! as XRHand
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.hand)) component.hand.set(json.hand)
  },

  onRemove: (entity, component) => {},

  reactor: function ({ root }) {
    const entity = root.entity

    if (!hasComponent(entity, XRRightHandComponent)) throw root.stop()

    const hand = useComponent(entity, XRRightHandComponent)
    const rig = useOptionalComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (rig?.value) {
        proxifyHand(entity, 'right', rig.value.rig, XRRightHandComponent)
      }
    }, [hand, rig])

    return null
  }
})

export const XRHitTestComponent = defineComponent({
  name: 'XRHitTest',

  onInit: (entity) => {
    return {
      hitTestSource: null! as XRHitTestSource,
      hitTestResult: null as XRHitTestResult | null
    }
  },

  onSet: (entity, component, json) => {
    if (json?.hitTestSource) component.hitTestSource.set(json.hitTestSource)
  },

  toJSON: () => {
    return null! as {
      hitTestSource: XRHitTestSource
    }
  }
})

export const XRAnchorComponent = defineComponent({
  name: 'XRAnchor',

  onInit: (entity) => {
    return {
      anchor: null! as XRAnchor
    }
  },

  onSet: (entity, component, json) => {
    if (json?.anchor) component.anchor.set(json.anchor)
  },

  onRemove: (entity, component) => {
    component.anchor.value.delete()
  },

  toJSON: () => {
    return null! as {
      anchor: XRAnchor
    }
  }
})

export type XRHand = Map<XRHandJoint, XRJointSpace>

export const XRPlaneComponent = defineComponent({ name: 'XRPlaneComponent' })
