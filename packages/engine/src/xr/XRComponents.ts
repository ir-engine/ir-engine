import { useEffect } from 'react'
import { BufferGeometry, Mesh } from 'three'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../common/functions/MatchesUtils'
import { defineComponent, useOptionalComponent } from '../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../transform/components/TransformComponent'
import { XRState } from './XRState'

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

/** Maps each XR Joint to it's corresponding Avatar Bone */
export const XRJointAvatarBoneMap = {
  wrist: 'Hand',
  'thumb-metacarpal': 'HandThumb1',
  'thumb-phalanx-proximal': 'HandThumb2',
  'thumb-phalanx-distal': 'HandThumb3',
  'thumb-tip': 'HandThumb4',
  'index-finger-metacarpal': 'HandIndex1',
  'index-finger-phalanx-proximal': 'HandIndex2',
  'index-finger-phalanx-intermediate': 'HandIndex3',
  'index-finger-phalanx-distal': 'HandIndex4',
  'index-finger-tip': 'HandIndex5',
  'middle-finger-metacarpal': 'HandMiddle1',
  'middle-finger-phalanx-proximal': 'HandMiddle2',
  'middle-finger-phalanx-intermediate': 'HandMiddle3',
  'middle-finger-phalanx-distal': 'HandMiddle4',
  'middle-finger-tip': 'HandMiddle5',
  'ring-finger-metacarpal': 'HandRing1',
  'ring-finger-phalanx-proximal': 'HandRing2',
  'ring-finger-phalanx-intermediate': 'HandRing3',
  'ring-finger-phalanx-distal': 'HandRing4',
  'ring-finger-tip': 'HandRing5',
  'pinky-finger-metacarpal': 'HandPinky1',
  'pinky-finger-phalanx-proximal': 'HandPinky2',
  'pinky-finger-phalanx-intermediate': 'HandPinky3',
  'pinky-finger-phalanx-distal': 'HandPinky4',
  'pinky-finger-tip': 'HandPinky5'
} as Record<XRHandJoint, string> // BoneName without the handedness

export const XRJointBones = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip'
] as XRHandJoint[]

export const HandBones = [
  'Hand',
  'HandThumb1',
  'HandThumb2',
  'HandThumb3',
  'HandThumb4',
  'HandIndex1',
  'HandIndex2',
  'HandIndex3',
  'HandIndex4',
  'HandIndex5',
  'HandMiddle1',
  'HandMiddle2',
  'HandMiddle3',
  'HandMiddle4',
  'HandMiddle5',
  'HandRing1',
  'HandRing2',
  'HandRing3',
  'HandRing4',
  'HandRing5',
  'HandPinky1',
  'HandPinky2',
  'HandPinky3',
  'HandPinky4',
  'HandPinky5'
]

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

  onRemove: (entity, component) => {}
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

  onRemove: (entity, component) => {}
})

export const XRHitTestComponent = defineComponent({
  name: 'XRHitTest',

  onInit: (entity) => {
    return {
      options: null! as XRTransientInputHitTestOptionsInit | XRHitTestOptionsInit,
      source: null! as XRHitTestSource,
      results: [] as XRHitTestResult[]
    }
  },

  onSet: (entity, component, data: XRTransientInputHitTestOptionsInit | XRHitTestOptionsInit) => {
    component.options.set(data)
  },

  onRemove: (entity, component) => {
    component.source.value?.cancel()
  },

  reactor: ({ root }) => {
    const entity = root.entity

    const hitTest = useOptionalComponent(entity, XRHitTestComponent)

    useEffect(() => {
      if (!hitTest) return

      const options = hitTest.options.value
      const xrState = getMutableState(XRState).value

      let active = true

      if ('space' in options) {
        xrState.session?.requestHitTestSource?.(options)?.then((source) => {
          if (active) {
            hitTest.source.set(source)
            hitTest.results.set([])
          } else {
            source.cancel()
          }
        })
      } else {
        xrState.session?.requestHitTestSourceForTransientInput?.(options)?.then((source) => {
          if (active) {
            hitTest.source.set(source)
            hitTest.results.set([])
          } else {
            source.cancel()
          }
        })
      }

      return () => {
        active = false
        hitTest?.source?.value?.cancel?.()
      }
    }, [hitTest?.options])

    return null
  }
})

export const XRAnchorComponent = defineComponent({
  name: 'XRAnchor',

  onInit: (entity) => {
    return {
      anchor: null! as XRAnchor
    }
  },

  onSet: (
    entity,
    component,
    data: {
      anchor: XRAnchor
    }
  ) => {
    component.anchor.value?.delete()
    component.anchor.set(data.anchor)
  },

  onRemove: (entity, component) => {
    component.anchor.value.delete()
  }
})

export type XRHand = Map<XRHandJoint, XRJointSpace>

export const XRPlaneComponent = defineComponent({
  name: 'XRPlaneComponent',

  onInit(entity) {
    return {
      shadowMesh: null! as Mesh,
      occlusionMesh: null! as Mesh,
      geometry: null! as BufferGeometry,
      placementHelper: null! as Mesh,
      plane: null! as XRPlane
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (matches.object.test(json.shadowMesh)) component.shadowMesh.set(json.shadowMesh as Mesh)
    if (matches.object.test(json.occlusionMesh)) component.occlusionMesh.set(json.occlusionMesh as Mesh)
    if (matches.object.test(json.placementHelper)) component.placementHelper.set(json.placementHelper as Mesh)
    if (matches.object.test(json.geometry)) {
      component.geometry.value?.dispose?.()
      component.geometry.set(json.geometry as BufferGeometry)
    }
    if (matches.object.test(json.plane)) {
      component.plane.set(json.plane as XRPlane)
    }
  },

  onRemove(entity, component) {
    component.shadowMesh.value?.traverse((mesh: Mesh) => {
      if (mesh.geometry) mesh.geometry.dispose()
    })
    component.occlusionMesh.value.traverse((mesh: Mesh) => {
      if (mesh.geometry) mesh.geometry.dispose()
    })
    component.placementHelper.value?.traverse((mesh: Mesh) => {
      if (mesh.geometry) mesh.geometry.dispose()
    })
    component.geometry.value?.dispose?.()
  },

  reactor: function ({ root }) {
    const entity = root.entity
    const plane = useOptionalComponent(entity, XRPlaneComponent)
    const scenePlacementMode = useHookstate(getMutableState(XRState).scenePlacementMode)

    useEffect(() => {
      if (!plane) return

      const shadowMesh = plane.shadowMesh.value
      const occlusionMesh = plane.occlusionMesh.value

      const setGeometry = (mesh: Mesh) => {
        if (mesh.geometry) mesh.geometry = plane.geometry.value
      }

      shadowMesh.traverse(setGeometry)
      occlusionMesh.traverse(setGeometry)
    }, [plane?.geometry])

    useEffect(() => {
      if (!plane) return
      const placementHelper = plane.placementHelper.value
      placementHelper.visible = scenePlacementMode.value === 'placing'
    }, [scenePlacementMode])

    return null
  }
})
