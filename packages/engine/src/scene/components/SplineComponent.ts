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
import { CatmullRomCurve3, Quaternion, Vector3 } from 'three'

import {
  defineComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { Vector3_Up } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'

import { SplineHelperComponent } from './debug/SplineHelperComponent'

export const SplineComponent = defineComponent({
  name: 'SplineComponent',
  jsonID: 'EE_spline',

  onInit: (entity) => {
    return {
      elements: [
        { position: new Vector3(-1, 0, -1), quaternion: new Quaternion() },
        {
          position: new Vector3(1, 0, -1),
          quaternion: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI / 2)
        },
        {
          position: new Vector3(1, 0, 1),
          quaternion: new Quaternion().setFromAxisAngle(Vector3_Up, Math.PI)
        },
        {
          position: new Vector3(-1, 0, 1),
          quaternion: new Quaternion().setFromAxisAngle(Vector3_Up, (3 * Math.PI) / 2)
        }
      ] as Array<{
        position: Vector3
        quaternion: Quaternion
      }>,
      // internal
      curve: new CatmullRomCurve3([], true)
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    json.elements &&
      component.elements.set(
        json.elements.map((e) => ({
          position: new Vector3().copy(e.position),
          quaternion: new Quaternion().copy(e.quaternion)
        }))
      )
  },

  toJSON: (entity, component) => {
    return { elements: component.elements.get({ noproxy: true }) }
  },

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, SplineComponent)
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const elements = component.elements

    useEffect(() => {
      if (elements.length < 3) {
        component.curve.set(new CatmullRomCurve3([], true))
        return
      }

      const curve = new CatmullRomCurve3(
        elements.value.map((e) => e.position),
        true
      )
      curve.curveType = 'catmullrom'
      component.curve.set(curve)
    }, [
      elements.length,
      // force a unique dep change upon any position or quaternion change
      elements.value.map((e) => `${JSON.stringify(e.position)}${JSON.stringify(e.quaternion)})`).join('')
    ])

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, SplineHelperComponent)
      }

      return () => {
        removeComponent(entity, SplineHelperComponent)
      }
    }, [debugEnabled])

    return null
  }
})
