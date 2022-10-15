// TODO: this should not be here
import { WebContainer3D } from '@etherealjs/web-layer/three/WebContainer3D'
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  RingGeometry
} from 'three'

import { hookstate } from '@xrengine/hyperflux/functions/StateFunctions'

import { proxifyVector3 } from '../common/proxies/createThreejsProxy'
import { Entity } from '../ecs/classes/Entity'
import { createMappedComponent, defineComponent } from '../ecs/functions/ComponentFunctions'
import { addObjectToGroup } from '../scene/components/GroupComponent'
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

  onAdd: (entity) => {
    return hookstate({
      hitTestSource: null as XRHitTestSource | null,
      hitTestResult: null as XRHitTestResult | null
    })
  },

  onUpdate: (entity, component, json) => {
    if (json.hitTestSource) component.hitTestSource.set(json.hitTestSource)
  },

  toJSON: () => {
    return null! as {
      hitTestSource: XRHitTestSource | null
    }
  }
})

export const XRAnchorComponent = defineComponent({
  name: 'XRAnchor',

  onAdd: (entity) => {
    return hookstate({
      anchor: null! as XRAnchor
    })
  },

  onUpdate: (entity, component, json) => {
    if (json.anchor) component.anchor.set(json.anchor)
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

export const InputSourceComponent = defineComponent({
  name: 'XRControllerComponent',
  onAdd: (entity) => {
    return {
      inputSource: null! as XRInputSource
    }
  },

  onUpdate: (entity, component, json) => {
    if (json.inputSource) component.inputSource = json.inputSource as XRInputSource
  },

  toJSON: () => {
    return null! as {
      inputSource: XRInputSource
    }
  }
})

export const XRControllerComponent = defineComponent({
  name: 'XRControllerComponent',
  onAdd: (entity) => {
    return {
      targetRaySpace: null! as XRSpace,
      handedness: null! as XRHandedness,
      grip: null as Entity | null,
      hand: null as Entity | null
    }
  },

  onUpdate: (entity, component, json) => {
    if (json.targetRaySpace) component.targetRaySpace = json.targetRaySpace as XRSpace
    if (json.handedness) component.handedness = json.handedness as XRHandedness
  },

  toJSON: () => {
    return null! as {
      targetRaySpace: XRSpace
      handedness: XRHandedness
      grip: Entity | null
      hand: Entity | null
    }
  }
})

export type PointerObject = Object3D & {
  targetRay?: Mesh<BufferGeometry, MeshBasicMaterial>
  cursor?: Mesh<BufferGeometry, MeshBasicMaterial>
  lastHit?: ReturnType<typeof WebContainer3D.prototype.hitTest> | null
}

export const XRPointerComponent = defineComponent({
  name: 'XRPointer',

  onAdd: (entity) => {
    return {
      pointer: null! as PointerObject
    }
  },

  onUpdate: (entity, component, json) => {
    if (json.pointer) component.pointer = json.pointer as PointerObject
  },

  toJSON: () => {
    return null! as {
      pointer: PointerObject
    }
  }
})

export const XRControllerGripComponent = defineComponent({
  name: 'XRControllerGrip',
  onAdd: (entity) => {
    return {
      gripSpace: null! as XRSpace,
      handedness: null! as XRHandedness
    }
  },

  onUpdate: (entity, component, json) => {
    if (json.gripSpace) component.gripSpace = json.gripSpace as XRSpace
    if (json.handedness) component.handedness = json.handedness as XRHandedness
  },

  toJSON: () => {
    return null! as {
      gripSpace: XRSpace
      handedness: XRHandedness
    }
  }
})

export const XRHandComponent = defineComponent({
  name: 'XRHand',
  onAdd: (entity) => {
    const group = new Group()
    addObjectToGroup(entity, group)
    return {
      hand: null! as XRHand,
      group,
      handedness: null! as XRHandedness,
      joints: {} as { [name: string]: Group & { jointRadius: number | undefined } },
      pinching: false
    }
  },

  onUpdate: (entity, component, json) => {
    if (json.hand) component.hand = json.hand as XRHand
    if (json.handedness) component.handedness = json.handedness as XRHandedness
  },

  toJSON: () => {
    return null! as {
      hand: XRHand
      handedness: XRHandedness
    }
  }
})
