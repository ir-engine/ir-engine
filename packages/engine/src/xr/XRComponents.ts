// TODO: this should not be here
import { Engine } from 'behave-graph'
import { useEffect, useReducer } from 'react'
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

import { getState, useHookstate } from '@xrengine/hyperflux'

import { matches } from '../common/functions/MatchesUtils'
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
import { XRState } from './XRState'

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
  'XRHandsInput',
  XRHandsInputSchema
)

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
      const xrState = getState(XRState).value

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

  onInit(entity, world) {
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
    const scenePlacementMode = useHookstate(getState(XRState).scenePlacementMode)

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
