// TODO: this should not be here
import { WebContainer3D } from '@etherealjs/web-layer/three/WebContainer3D'
import { useEffect } from 'react'
import {
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  RingGeometry,
  ShadowMaterial
} from 'three'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { matches } from '../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../common/proxies/createThreejsProxy'
import { Entity, UndefinedEntity } from '../ecs/classes/Entity'
import {
  createMappedComponent,
  defineComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../ecs/functions/ComponentFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../scene/components/GroupComponent'
import { QuaternionSchema, Vector3Schema } from '../transform/components/TransformComponent'

export type XRHandsInputComponentType = {
  /**
   * @property {Group} hands
   * Hand controllers
   */
  hands: Group[]
}

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
        proxifyVector3(XRLeftHandComponent.wrist.position, entity, rig.value.rig.LeftHand.position)
        proxifyQuaternion(XRLeftHandComponent.wrist.quaternion, entity, rig.value.rig.LeftHand.quaternion)
        // ..etc
      }
    }, [hand, rig])

    return null
  }
})

export const XRRightHandComponent = defineComponent({
  name: 'XRRightHandComponent',
  schema: HandSchema
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
