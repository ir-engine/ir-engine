/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import { getState, matches } from '@etherealengine/hyperflux'

import { defineComponent, setComponent, useOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'
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
  // wrist: '', // handled by IK target
  'thumb-metacarpal': 'ThumbMetacarpal',
  'thumb-phalanx-proximal': 'ThumbProxal',
  'thumb-phalanx-distal': 'ThumbDistal',
  // 'thumb-tip': '', // no tips needed for FK
  'index-finger-metacarpal': 'IndexMetacarpal',
  'index-finger-phalanx-proximal': 'IndexProximal',
  'index-finger-phalanx-intermediate': 'IndexIntermediate',
  'index-finger-phalanx-distal': 'IndexDistal',
  // 'index-finger-tip': '',
  'middle-finger-metacarpal': 'MiddleMetacarpal',
  'middle-finger-phalanx-proximal': 'MiddleProximal',
  'middle-finger-phalanx-intermediate': 'MiddleIntermediate',
  'middle-finger-phalanx-distal': 'MiddleDistal',
  // 'middle-finger-tip': '',
  'ring-finger-metacarpal': 'RingMetacarpal',
  'ring-finger-phalanx-proximal': 'RingProximal',
  'ring-finger-phalanx-intermediate': 'RingIntermediate',
  'ring-finger-phalanx-distal': 'RingDistal',
  // 'ring-finger-tip': '',
  'pinky-finger-metacarpal': 'LittleMetacarpal',
  'pinky-finger-phalanx-proximal': 'LittleProximal',
  'pinky-finger-phalanx-intermediate': 'LittleIntermediate',
  'pinky-finger-phalanx-distal': 'LittleDistal'
  // 'pinky-finger-tip': ''
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

export const XRLeftHandComponent = defineComponent({
  name: 'XRLeftHandComponent',

  onInit: (entity) => {
    return {
      hand: null! as XRHand,
      rotations: new Float32Array(4 * 19)
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.hand)) component.hand.set(json.hand)
  }
})

export const XRRightHandComponent = defineComponent({
  name: 'XRRightHandComponent',

  onInit: (entity) => {
    return {
      hand: null! as XRHand,
      rotations: new Float32Array(4 * 19)
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.hand)) component.hand.set(json.hand)
  }
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

  reactor: () => {
    const entity = useEntityContext()

    const hitTest = useOptionalComponent(entity, XRHitTestComponent)

    useEffect(() => {
      if (!hitTest) return

      const options = hitTest.options.value
      const xrState = getState(XRState)

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

export const XRSpaceComponent = defineComponent({
  name: 'XRSpace',

  onInit: (entity) => {
    return null! as XRSpace
  },

  onSet: (entity, component, space: XRSpace) => {
    component.set(space)
    setComponent(entity, TransformComponent)
  }
})
