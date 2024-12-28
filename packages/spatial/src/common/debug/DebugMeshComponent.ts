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
import { BufferGeometry, Material, MeshBasicMaterial, NormalBufferAttributes } from 'three'

import { defineComponent, setComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { NO_PROXY } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useMeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '../../renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '../../renderer/constants/ObjectLayers'
import { useHelperEntity } from './DebugComponentUtils'

export const DebugMeshComponent = defineComponent({
  name: 'DebugMeshComponent',

  schema: S.Object({
    name: S.String('debug-mesh'),
    geometry: S.Required(S.Type<BufferGeometry>()),
    material: S.Class(() => new MeshBasicMaterial() as Material),
    entity: S.Optional(S.Entity())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, DebugMeshComponent)
    const helperEntity = useHelperEntity(entity, component)
    const mesh = useMeshComponent(
      helperEntity,
      component.geometry.value as BufferGeometry<NormalBufferAttributes>,
      component.material.value as Material
    )

    useEffect(() => {
      setComponent(helperEntity, ObjectLayerMaskComponent, ObjectLayerMasks.NodeHelper)
    }, [])

    useEffect(() => {
      const geo = component.geometry.get(NO_PROXY)
      if (geo != mesh.geometry.value) mesh.geometry.set(geo)
    }, [component.geometry])

    useEffect(() => {
      const mat = component.material.get(NO_PROXY)
      if (mat != mesh.material.value) mesh.material.set(mat)
    }, [component.material])

    return null
  }
})
