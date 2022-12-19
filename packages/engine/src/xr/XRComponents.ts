// TODO: this should not be here
import { WebContainer3D } from '@etherealjs/web-layer/three/WebContainer3D'
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

import { Entity, UndefinedEntity } from '../ecs/classes/Entity'
import { createMappedComponent, defineComponent } from '../ecs/functions/ComponentFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../scene/components/GroupComponent'
import { QuaternionSchema, Vector3Schema } from '../transform/components/TransformComponent'

export type XRGripButtonComponentType = {}

/** @deprecated */
export const XRLGripButtonComponent = createMappedComponent<XRGripButtonComponentType>('XRLGripButtonComponent')
/** @deprecated */
export const XRRGripButtonComponent = createMappedComponent<XRGripButtonComponentType>('XRRGripButtonComponent')

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

const XRHandsInputSchema = {
  left: HandSchema,
  right: HandSchema
}
/** @deprecated */
export const XRHandsInputComponent = createMappedComponent<XRHandsInputComponentType, typeof XRHandsInputSchema>(
  'XRHandsInputComponent',
  XRHandsInputSchema
)

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
