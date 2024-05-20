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
import {
  BufferGeometry,
  Color,
  ColorRepresentation,
  LineBasicMaterial,
  LineSegments,
  Material,
  NormalBufferAttributes
} from 'three'

import { defineComponent, Entity, setComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { NO_PROXY } from '@etherealengine/hyperflux'

import { matchesColor, matchesGeometry, matchesMaterial } from '../../common/functions/MatchesUtils'
import { NameComponent } from '../../common/NameComponent'
import { useDisposable, useResource } from '../../resources/resourceHooks'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

export const LineSegmentComponent = defineComponent({
  name: 'LineSegmentComponent',

  onInit: (entity) => {
    return {
      name: 'line-segment',
      geometry: null! as BufferGeometry,
      material: new LineBasicMaterial() as Material & { color: Color },
      color: undefined as undefined | ColorRepresentation,
      layerMask: ObjectLayers.NodeHelper,
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
    if (typeof json.layerMask === 'number') component.layerMask.set(json.layerMask)
  },

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, LineSegmentComponent)
    const [geometryState] = useResource(component.geometry.value, entity, component.geometry.uuid.value)
    const [materialState] = useResource(component.material.value, entity, component.material.uuid.value)
    const [lineSegment] = useDisposable(
      LineSegments,
      entity,
      geometryState.value as BufferGeometry<NormalBufferAttributes>,
      materialState.value as Material
    )

    useEffect(() => {
      addObjectToGroup(entity, lineSegment)
      setVisibleComponent(entity, true)
      return () => {
        removeObjectFromGroup(entity, lineSegment)
      }
    }, [])

    useEffect(() => {
      setComponent(entity, NameComponent, component.name.value)
    }, [component.name])

    useEffect(() => {
      setComponent(entity, ObjectLayerMaskComponent, component.layerMask.value)
    }, [component.layerMask])

    useEffect(() => {
      const color = component.color.value
      if (!color) return
      const mat = component.material.get(NO_PROXY) as Material & { color: Color }
      mat.color.set(color)
      mat.needsUpdate = true
    }, [component.color])

    useEffect(() => {
      const geo = component.geometry.get(NO_PROXY) as BufferGeometry<NormalBufferAttributes>
      if (geo != geometryState.value) {
        geometryState.set(geo)
        lineSegment.geometry = geo
      }
    }, [component.geometry])

    useEffect(() => {
      const mat = component.material.get(NO_PROXY) as Material
      if (mat != materialState.value) {
        materialState.set(component.material.get(NO_PROXY))
        lineSegment.material = mat
      }
      mat.needsUpdate = true
    }, [component.material])

    return null
  }
})
