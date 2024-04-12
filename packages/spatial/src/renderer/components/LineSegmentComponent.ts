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

import { useDidMount } from '@etherealengine/common/src/utils/useDidMount'
import { Entity, defineComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { useObj, useResource } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { BufferGeometry, Color, ColorRepresentation, LineBasicMaterial, LineSegments, Material } from 'three'
import { useHelperEntity } from '../../common/debug/DebugComponentUtils'
import { matchesColor, matchesGeometry, matchesMaterial } from '../../common/functions/MatchesUtils'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const LineSegmentComponent = defineComponent({
  name: 'LineSegmentComponent',

  onInit: (entity) => {
    return {
      name: 'line-segment',
      geometry: null! as BufferGeometry,
      material: new LineBasicMaterial() as Material & { color: Color },
      color: 0xffffff as ColorRepresentation,
      entity: undefined as undefined | Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.name === 'string') component.name.set(json.name)

    if (matchesGeometry.test(json.geometry)) component.geometry.set(json.geometry)
    else throw new Error('LineSegmentComponent: Geometry required for LineSegmentComponent')

    if (matchesMaterial.test(json.material)) component.material.set(json.material)
    if (matchesColor.test(json.color)) component.color.set(json.color)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, LineSegmentComponent)
    const [geometryState] = useResource(component.geometry.value, entity, component.geometry.uuid.value)
    const [materialState] = useResource(component.material.value, entity, component.material.uuid.value)
    const [lineSegment] = useObj(LineSegments, entity, geometryState.value, materialState.value)
    useHelperEntity(entity, lineSegment, component)

    useEffect(() => {
      addObjectToGroup(entity, lineSegment)
      return () => {
        removeObjectFromGroup(entity, lineSegment)
      }
    }, [])

    useEffect(() => {
      const mat = component.material.get(NO_PROXY)
      mat.color.set(component.color.value)
      mat.needsUpdate = true
    }, [component.color])

    useDidMount(() => {
      const geo = component.geometry.get(NO_PROXY)
      geometryState.set(geo)
    }, [component.geometry])

    useDidMount(() => {
      const mat = component.material.get(NO_PROXY)
      materialState.set(mat)
      mat.needsUpdate = true
    }, [component.material])

    return null
  }
})
