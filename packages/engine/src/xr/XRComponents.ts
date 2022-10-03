// TODO: this should not be here
import { WebContainer3D } from '@etherealjs/web-layer/three/WebContainer3D'
import { BufferGeometry, Group, Mesh, MeshBasicMaterial } from 'three'

import { hookstate } from '@xrengine/hyperflux/functions/StateFunctions'

import { createMappedComponent, defineComponent } from '../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../transform/components/TransformComponent'

export type XRGripButtonComponentType = {}

export const XRLGripButtonComponent = createMappedComponent<XRGripButtonComponentType>('XRLGripButtonComponent')
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

export const XRHandsInputComponent = createMappedComponent<XRHandsInputComponentType, typeof XRHandsInputSchema>(
  'XRHandsInputComponent',
  XRHandsInputSchema
)

export type ControllerGroup = Group & {
  targetRay: Mesh<BufferGeometry, MeshBasicMaterial>
  cursor: Mesh<BufferGeometry, MeshBasicMaterial>
  lastHit: ReturnType<typeof WebContainer3D.prototype.hitTest> | null
}

export type XRInputSourceComponentType = {
  // Flatten the controller hirearchy
  // to be able to send the data over network
  // (do not use directly)
  controllerLeftParent: Group
  controllerRightParent: Group
  controllerGripLeftParent: Group
  controllerGripRightParent: Group

  /**
   * @property {ControllerGroup} controllerLeft
   * @property {ControllerGroup} controllerRight
   * the controllers
   */
  controllerLeft: ControllerGroup
  controllerRight: ControllerGroup

  /**
   * @property {Group} controllerGripLeft
   * @property {Group} controllerGripRight
   * controller grips hold the information for grips, which are where the user grabs things from
   */
  controllerGripLeft: Group
  controllerGripRight: Group

  /**
   * @property {Group} controllerGroup is the group that holds all the controller groups,
   * so they can be transformed together
   */
  container: Group

  /**
   * @property {Group} head
   */
  head: Group
}

const GroupSchema = {
  position: Vector3Schema,
  quaternion: QuaternionSchema
}

const XRInputSourceSchema = {
  controllerLeftParent: GroupSchema,
  controllerRightParent: GroupSchema,
  controllerGripLeftParent: GroupSchema,
  controllerGripRightParent: GroupSchema,

  controllerLeft: GroupSchema,
  controllerRight: GroupSchema,
  controllerGripLeft: GroupSchema,
  controllerGripRight: GroupSchema,
  container: GroupSchema,
  head: GroupSchema
}

export const XRInputSourceComponent = createMappedComponent<XRInputSourceComponentType, typeof XRInputSourceSchema>(
  'XRInputSourceComponent',
  XRInputSourceSchema
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
