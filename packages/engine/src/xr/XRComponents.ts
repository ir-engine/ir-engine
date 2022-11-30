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

export const InputSourceComponent = defineComponent({
  name: 'XRControllerComponent',
  onInit: (entity) => {
    return {
      inputSource: null! as XRInputSource
    }
  },

  onSet: (entity, component, json) => {
    if (json?.inputSource) component.inputSource.set(json.inputSource as XRInputSource)
  },

  toJSON: () => {
    return null! as {
      inputSource: XRInputSource
    }
  }
})

export const XRControllerComponent = defineComponent({
  name: 'XRControllerComponent',
  onInit: (entity) => {
    return {
      targetRaySpace: null! as XRSpace,
      handedness: null! as XRHandedness,
      grip: UndefinedEntity,
      hand: UndefinedEntity
    }
  },

  onSet: (entity, component, json) => {
    if (json?.targetRaySpace) component.targetRaySpace.set(json.targetRaySpace)
    if (json?.handedness) component.handedness.set(json.handedness)
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

export type PointerObject = (Line<BufferGeometry, LineBasicMaterial> | Mesh<RingGeometry, MeshBasicMaterial>) & {
  targetRay?: Mesh<BufferGeometry, MeshBasicMaterial>
  cursor?: Mesh<BufferGeometry, MeshBasicMaterial>
  lastHit?: ReturnType<typeof WebContainer3D.prototype.hitTest> | null
}

export const XRPointerComponent = defineComponent({
  name: 'XRPointer',

  onInit: (entity) => {
    return {
      pointer: null! as PointerObject
    }
  },

  onSet: (entity, component, json) => {
    if (json?.pointer) component.pointer.set(json.pointer as PointerObject)
  },

  toJSON: () => {
    return null! as {
      pointer: PointerObject
    }
  }
})

export const XRControllerGripComponent = defineComponent({
  name: 'XRControllerGrip',
  onInit: (entity) => {
    return {
      gripSpace: null! as XRSpace,
      handedness: null! as XRHandedness
    }
  },

  onSet: (entity, component, json) => {
    if (json?.gripSpace) component.gripSpace.set(json.gripSpace)
    if (json?.handedness) component.handedness.set(json.handedness)
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
  onInit: (entity) => {
    const group = new Group()
    group.name = `xr-hand-${entity}`
    addObjectToGroup(entity, group)
    return {
      hand: null! as XRHand,
      group,
      handedness: null! as XRHandedness,
      joints: {} as { [name: string]: Group & { jointRadius: number | undefined } },
      pinching: false
    }
  },

  onSet: (entity, component, json) => {
    if (json?.hand) component.hand.set(json.hand)
    if (json?.handedness) component.handedness.set(json.handedness)
  },

  toJSON: () => {
    return null! as {
      hand: XRHand
      handedness: XRHandedness
    }
  }
})

export const XRPlaneComponent = defineComponent({ name: 'XRPlaneComponent' })
