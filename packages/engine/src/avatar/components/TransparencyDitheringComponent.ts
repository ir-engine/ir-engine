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

import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'
import { matchesVector3 } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { PluginObjectType, addOBCPlugin } from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { EntityTreeComponent, iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { FrontSide, Material, Vector3 } from 'three'
import matches from 'ts-matches'
import { ModelComponent } from '../../scene/components/ModelComponent'
import {
  ditheringAlphatestChunk,
  ditheringFragUniform,
  ditheringVertex,
  ditheringVertexUniform
} from '../functions/ditherShaderChunk'

export const TransparencyDitheringComponent = defineComponent({
  name: 'TransparencyDitheringComponent',
  onInit: (entity) => {
    return {
      ditheringDistance: 0.1,
      ditheringExponent: 2.5,
      center: new Vector3(),
      useWorldSpace: true,
      overrideFaceCulling: false,
      //internal
      matIds: [] as string[]
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.ditheringDistance)) component.ditheringDistance.set(json.ditheringDistance)
    if (matches.number.test(json.ditheringExponent)) component.ditheringExponent.set(json.ditheringExponent)
    if (matchesVector3.test(json.center)) component.center.set(new Vector3().copy(json.center))
    if (matches.boolean.test(json.useWorldSpace)) component.useWorldSpace.set(json.useWorldSpace)
    if (matches.boolean.test(json.overrideFaceCulling)) component.overrideFaceCulling.set(json.overrideFaceCulling)
  },

  reactor: () => {
    const entity = useEntityContext()
    const modelComponent = useComponent(entity, ModelComponent)
    const entityComponent = useComponent(entity, EntityTreeComponent)
    const useBasicMaterials = useHookstate(getMutableState(RendererState).forceBasicMaterials)
    const transparencyDitheringComponent = useComponent(entity, TransparencyDitheringComponent)
    /** Injects dithering logic into avatar materials */
    useEffect(() => {
      const { ditheringExponent, ditheringDistance, center, useWorldSpace, matIds, overrideFaceCulling } = getComponent(
        entity,
        TransparencyDitheringComponent
      )
      transparencyDitheringComponent.matIds.forEach((id) => id.set(none))
      iterateEntityNode(entity, (node) => {
        const mesh = getOptionalComponent(node, MeshComponent)
        if (!mesh) return
        const material = mesh.material as Material
        /** Account for meshes sharing the same material */
        if (!matIds.find((id) => id === material.uuid)) {
          transparencyDitheringComponent.matIds.set([...matIds, material.uuid])
          const plugin = material.plugins?.findIndex(
            (plugin: PluginObjectType) => plugin.id === 'transparency-dithering'
          )
          if (plugin !== undefined && plugin !== -1) material.plugins!.splice(plugin, 1)
          injectDitheringLogic(
            material,
            ditheringDistance,
            ditheringExponent,
            center,
            useWorldSpace,
            overrideFaceCulling
          )
          if (material.shader.uniforms.useWorldSpace) material.shader.uniforms.useWorldSpace.value = useWorldSpace
          if (material.shader.uniforms.ditheringDistance)
            material.shader.uniforms.ditheringDistance.value = ditheringDistance
          if (material.shader.uniforms.ditheringExponent)
            material.shader.uniforms.ditheringExponent.value = ditheringExponent
        }
      })
    }, [
      modelComponent.scene,
      entityComponent.children,
      useBasicMaterials,
      transparencyDitheringComponent.useWorldSpace,
      transparencyDitheringComponent.ditheringDistance,
      transparencyDitheringComponent.ditheringExponent
    ])
    return null
  }
})

const injectDitheringLogic = (
  material: Material,
  ditheringDistance: number,
  ditheringExponent: number,
  center: Vector3,
  useWorldSpace: boolean,
  overrideCulling: boolean
) => {
  material.alphaTest = 0.5
  if (overrideCulling) material.side = FrontSide
  console.log(overrideCulling)
  addOBCPlugin(material, {
    id: 'transparency-dithering',
    priority: 10,
    compile: (shader, renderer) => {
      if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition')) {
        shader.vertexShader = shader.vertexShader.replace(
          /#include <common>/,
          '#include <common>\n' + ditheringVertexUniform
        )
      }

      shader.vertexShader = shader.vertexShader.replace(
        /#include <worldpos_vertex>/,
        '	#include <worldpos_vertex>\n' + ditheringVertex
      )

      if (!shader.fragmentShader.startsWith('varying vec3 vWorldPosition'))
        shader.fragmentShader = shader.fragmentShader.replace(
          /#include <common>/,
          '#include <common>\n' + ditheringFragUniform
        )

      shader.fragmentShader = shader.fragmentShader.replace(/#include <alphatest_fragment>/, ditheringAlphatestChunk)
      shader.uniforms.ditheringCenter = {
        value: center
      }
      shader.uniforms.ditheringDistance = { value: ditheringDistance }
      shader.uniforms.ditheringExponent = { value: ditheringExponent }
      shader.uniforms.useWorldSpace = { value: useWorldSpace }
      material.shader = shader
    }
  })
}
