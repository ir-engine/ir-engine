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

import { useLayoutEffect } from 'react'
import { MeshLambertMaterial } from 'three'

import { defineComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { Geometry } from '@etherealengine/spatial/src/common/constants/Geometry'
import { useMeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'

import { GeometryTypeEnum, GeometryTypeToClass } from '../constants/GeometryTypeEnum'

const createGeometry = (geometryType: GeometryTypeEnum, geometryParams: Record<string, any>): Geometry => {
  const GeometryClass = GeometryTypeToClass[geometryType]
  const geometry = new GeometryClass(...Object.values(geometryParams))
  return geometry
}

export const PrimitiveGeometryComponent = defineComponent({
  name: 'PrimitiveGeometryComponent',
  jsonID: 'EE_primitive_geometry',

  onInit: (entity) => {
    return {
      geometryType: GeometryTypeEnum.BoxGeometry as GeometryTypeEnum,
      geometryParams: {} as Record<string, any>
    }
  },

  toJSON: (entity, component) => {
    return {
      geometryType: component.geometryType.value,
      geometryParams: component.geometryParams.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.geometryType === 'number') component.geometryType.set(json.geometryType)
    if (typeof json.geometryParams === 'object') component.geometryParams.set(json.geometryParams)
  },

  reactor: () => {
    const entity = useEntityContext()
    const geometryComponent = useComponent(entity, PrimitiveGeometryComponent)
    const mesh = useMeshComponent(
      entity,
      () => createGeometry(geometryComponent.geometryType.value, geometryComponent.geometryParams.value),
      () => new MeshLambertMaterial()
    )

    useLayoutEffect(() => {
      mesh.geometry.set(createGeometry(geometryComponent.geometryType.value, geometryComponent.geometryParams.value))
    }, [geometryComponent.geometryType, geometryComponent.geometryParams])

    return null
  }
})
