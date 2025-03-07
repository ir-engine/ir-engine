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

import { useLayoutEffect } from 'react'
import { MeshStandardMaterial } from 'three'

import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { Geometry } from '@ir-engine/spatial/src/common/constants/Geometry'
import { useMeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { GeometryTypeEnum, GeometryTypeToFactory } from '../constants/GeometryTypeEnum'

const createGeometry = (geometryType: GeometryTypeEnum, geometryParams: Record<string, any>): Geometry => {
  const factory = GeometryTypeToFactory[geometryType]
  const geometry = factory(geometryParams)
  return geometry
}

export const PrimitiveGeometryComponent = defineComponent({
  name: 'PrimitiveGeometryComponent',
  jsonID: 'EE_primitive_geometry',

  schema: S.Object({
    geometryType: S.Enum(GeometryTypeEnum, GeometryTypeEnum.BoxGeometry),
    geometryParams: S.Record(S.String(), S.Any())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const geometryComponent = useComponent(entity, PrimitiveGeometryComponent)
    const mesh = useMeshComponent(
      entity,
      () => createGeometry(geometryComponent.geometryType.value, geometryComponent.geometryParams.value),
      () => new MeshStandardMaterial()
    )

    useLayoutEffect(() => {
      mesh.geometry.set(createGeometry(geometryComponent.geometryType.value, geometryComponent.geometryParams.value))
    }, [geometryComponent.geometryType, geometryComponent.geometryParams])

    return null
  }
})
