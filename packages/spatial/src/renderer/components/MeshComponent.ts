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
import { BufferGeometry, Material, Mesh } from 'three'

import { Entity, useEntityContext } from '@etherealengine/ecs'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { State, useImmediateEffect } from '@etherealengine/hyperflux'

import { useResource } from '../../resources/resourceHooks'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const MeshComponent = defineComponent({
  name: 'Mesh Component',
  jsonID: 'EE_mesh',

  onInit: (entity) => null! as Mesh,

  onSet: (entity, component, mesh: Mesh) => {
    if (!mesh || !mesh.isMesh) throw new Error('MeshComponent: Invalid mesh')
    component.set(mesh)
  },

  reactor: () => {
    const entity = useEntityContext()
    const meshComponent = useComponent(entity, MeshComponent)
    const [meshResource] = useResource(meshComponent.value, entity, meshComponent.uuid.value)
    const [geometryResource] = useResource(meshComponent.geometry.value, entity, meshComponent.geometry.uuid.value)
    const [materialResource] = useResource<Material | Material[]>(
      meshComponent.material.value as Material,
      entity,
      !Array.isArray(meshComponent.material.value) ? (meshComponent.material.value as Material).uuid : undefined
    )

    useEffect(() => {
      if (meshComponent.value !== meshResource.value) meshResource.set(meshComponent.value)
    }, [meshComponent])

    useEffect(() => {
      const mesh = meshComponent.value
      if (mesh.geometry !== geometryResource.value) geometryResource.set(mesh.geometry)
    }, [meshComponent.geometry])

    useEffect(() => {
      const mesh = meshComponent.value
      if (mesh.material !== materialResource.value) materialResource.set(mesh.material)

      if (Array.isArray(mesh.material)) {
        for (const material of mesh.material) material.needsUpdate = true
      } else {
        ;(mesh.material as Material).needsUpdate = true
      }
    }, [meshComponent.material])

    return null
  }
})

/**
 *
 * Adds a run time only mesh component to an entity that won't be serialized into the scene
 *
 * @param entity entity to add the mesh component to
 * @param geometry a Geometry instance or function returing a geometry instance to add to the mesh
 * @param material a Material instance or function returing a material instance to add to the mesh
 * @returns State<Mesh>
 */
export function useMeshComponent<TGeometry extends BufferGeometry, TMaterial extends Material>(
  entity: Entity,
  geometry: TGeometry | (() => TGeometry),
  material: TMaterial | (() => TMaterial)
): State<Mesh<TGeometry, TMaterial>> {
  if (!hasComponent(entity, MeshComponent)) {
    const geo = typeof geometry === 'function' ? geometry() : geometry
    const mat = typeof material === 'function' ? material() : material
    setComponent(entity, MeshComponent, new Mesh<TGeometry, TMaterial>(geo, mat))
  }

  const meshComponent = useComponent(entity, MeshComponent)

  useImmediateEffect(() => {
    const mesh = meshComponent.value as Mesh<TGeometry, TMaterial>
    mesh.userData['ignoreOnExport'] = true
    addObjectToGroup(entity, mesh)
    return () => {
      removeObjectFromGroup(entity, mesh)
      removeComponent(entity, MeshComponent)
    }
  }, [])

  return meshComponent as unknown as State<Mesh<TGeometry, TMaterial>>
}
