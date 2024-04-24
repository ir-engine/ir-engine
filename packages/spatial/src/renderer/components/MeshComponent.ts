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
import { Entity, useEntityContext } from '@etherealengine/ecs'
import {
  defineComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { NO_PROXY, State } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { useResource } from '../../resources/resourceHooks'
import { GeometryComponent } from './GeometryComponent'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MaterialComponent } from './MaterialComponent'

export const MeshComponent = defineComponent({
  name: 'Mesh Component',
  jsonID: 'EE_mesh',

  onInit: (entity) => null! as Mesh,

  onSet: (entity, component, mesh: Mesh) => {
    if (!mesh || !mesh.isMesh) throw new Error('MeshComponent: Invalid mesh')
    component.set(mesh)
    setComponent(entity, MaterialComponent, mesh.material)
    setComponent(entity, GeometryComponent, mesh.geometry)
  },

  onRemove: (entity, component) => {
    removeComponent(entity, MaterialComponent)
    removeComponent(entity, GeometryComponent)
  },

  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = useComponent(entity, MaterialComponent)
    const geometryComponent = useComponent(entity, GeometryComponent)
    const meshComponent = useComponent(entity, MeshComponent)
    const [meshResource] = useResource(meshComponent.value, entity, meshComponent.uuid.value)

    useDidMount(() => {
      meshResource.set(meshComponent.value)
    }, [meshComponent])

    useEffect(() => {
      const mesh = meshComponent.value
      const geo = geometryComponent.value
      if (geo != mesh.geometry) mesh.geometry = geo
    }, [geometryComponent])

    useEffect(() => {
      const mesh = meshComponent.value
      const mat = materialComponent.value
      if (mat != mesh.material) mesh.material = mat

      if (Array.isArray(mesh.material)) {
        for (const material of mesh.material) material.needsUpdate = true
      } else {
        mesh.material.needsUpdate = true
      }
    }, [materialComponent])

    return null
  }
})

/**
 *
 * Adds a MeshComponent to an entity with the passed in Geometry and Material
 * Functionally no different than calling setComponent(entity, MeshComponent, new Mesh(geometry, material)), but retains the typing for the Geometry and Material objects
 *
 * @param entity entity to add the mesh component to
 * @param geometry a Geometry instance to add to the mesh
 * @param material a Material instance to add to the mesh
 * @returns [Mesh, State<Geometry>, State<Material>]
 */
export function useMeshComponent<
  TGeometry extends BufferGeometry = BufferGeometry,
  TMaterial extends Material = Material
>(
  entity: Entity,
  geometry: TGeometry,
  material: TMaterial
): [Mesh<TGeometry, TMaterial>, State<TGeometry>, State<TMaterial>] {
  if (!hasComponent(entity, MeshComponent))
    setComponent(entity, MeshComponent, new Mesh<TGeometry, TMaterial>(geometry, material))

  const geometryComponent = useComponent(entity, GeometryComponent)
  const materialComponent = useComponent(entity, MaterialComponent)
  const meshComponent = useComponent(entity, MeshComponent)

  useEffect(() => {
    const mesh = meshComponent.value
    addObjectToGroup(entity, mesh)
    return () => {
      removeObjectFromGroup(entity, mesh)
      removeComponent(entity, MeshComponent)
    }
  }, [])

  return [
    meshComponent.get(NO_PROXY) as Mesh<TGeometry, TMaterial>,
    geometryComponent as State<TGeometry>,
    materialComponent as State<TMaterial>
  ]
}
