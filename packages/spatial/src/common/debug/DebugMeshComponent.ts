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
import { BufferGeometry, Material, MeshBasicMaterial, NormalBufferAttributes } from 'three'

import { defineComponent, Entity, setComponent, useComponent, useEntityContext } from '@etherealengine/ecs'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { matchesGeometry, matchesMaterial } from '@etherealengine/spatial/src/common/functions/MatchesUtils'

import { useMeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '../../renderer/components/ObjectLayerComponent'
import { ObjectLayerMasks } from '../../renderer/constants/ObjectLayers'
import { useHelperEntity } from './DebugComponentUtils'

export const DebugMeshComponent = defineComponent({
  name: 'DebugMeshComponent',

  onInit: (entity) => {
    return {
      name: 'debug-mesh',
      geometry: null! as BufferGeometry,
      material: new MeshBasicMaterial() as Material,
      entity: undefined as undefined | Entity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.name === 'string') component.name.set(json.name)

    if (matchesGeometry.test(json.geometry)) component.geometry.set(json.geometry)
    else throw new Error('DebugMeshComponent: Geometry required for MeshHelperComponent')
    if (matchesMaterial.test(json.material)) component.material.set(json.material)
  },

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
