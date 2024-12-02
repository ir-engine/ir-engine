/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { BufferGeometry, Color, LineBasicMaterial, LineSegments, Material, NormalBufferAttributes } from 'three'

import { defineComponent, setComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { NO_PROXY } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { useDisposable, useResource } from '../../resources/resourceHooks'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'
import { setVisibleComponent } from './VisibleComponent'

export const LineSegmentComponent = defineComponent({
  name: 'LineSegmentComponent',

  schema: S.Object({
    name: S.String('line-segment'),
    geometry: S.Required(S.Type<BufferGeometry>()),
    material: S.Class(() => new LineBasicMaterial() as Material),
    color: S.Optional(S.Color()),
    layerMask: S.Number(ObjectLayers.NodeHelper),
    entity: S.Optional(S.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, LineSegmentComponent)
    const [geometryState] = useResource(component.geometry.value, entity)
    const [materialState] = useResource(component.material.value, entity)
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
      const mat = component.material.get(NO_PROXY) as Material & { color?: Color }
      if (mat.color) {
        mat.color.set(color)
        mat.needsUpdate = true
      }
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
