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

import { BufferGeometry, Material, Mesh } from 'three'

import { useDidMount } from '@etherealengine/common/src/utils/useDidMount'
import { Entity, defineQuery } from '@etherealengine/ecs'
import { defineComponent, removeComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useObj, useResource } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { NO_PROXY, State } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const MeshComponent = defineComponent({
  name: 'Mesh Component',
  jsonID: 'EE_mesh',

  onInit: (entity) => null! as Mesh,

  onSet: (entity, component, mesh: Mesh) => {
    if (!mesh || !mesh.isMesh) throw new Error('MeshComponent: Invalid mesh')
    component.set(mesh)
  }
})

export const sceneMeshQuery = defineQuery([MeshComponent, SourceComponent])

export function useMeshComponent<
  TGeometry extends BufferGeometry = BufferGeometry,
  TMaterial extends Material = Material
>(
  entity: Entity,
  geometry: TGeometry = new BufferGeometry() as any,
  material: TMaterial = new Material() as any
): [Mesh<TGeometry, TMaterial>, State<TGeometry>, State<TMaterial>] {
  const [geometryState] = useResource(geometry, entity, geometry.uuid)
  const [materialState] = useResource(material, entity, material.uuid)
  const [mesh] = useObj(Mesh<TGeometry, TMaterial>, entity, geometry, material)

  useEffect(() => {
    setComponent(entity, MeshComponent, mesh)
    addObjectToGroup(entity, mesh)
    return () => {
      removeObjectFromGroup(entity, mesh)
      removeComponent(entity, MeshComponent)
    }
  }, [])

  useDidMount(() => {
    const geo = geometryState.get(NO_PROXY)
    mesh.geometry = geo
  }, [geometryState])

  useDidMount(() => {
    const mat = materialState.get(NO_PROXY)
    mesh.material = mat
    mesh.material.needsUpdate = true
  }, [materialState])

  return [mesh, geometryState, materialState]
}
