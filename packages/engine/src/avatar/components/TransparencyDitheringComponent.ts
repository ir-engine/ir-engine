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
      ditheringWorldDistance: 3,
      ditheringWorldExponent: 12,
      ditheringLocalDistance: 20,
      ditheringLocalExponent: 8,
      worldCenter: new Vector3(),
      localCenter: new Vector3(),
      useWorldCenter: true,
      useLocalCenter: false,
      overrideFaceCulling: false,
      //internal
      matIds: [] as string[]
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.ditheringWorldDistance))
      component.ditheringWorldDistance.set(json.ditheringWorldDistance)
    if (matches.number.test(json.ditheringWorldExponent))
      component.ditheringWorldExponent.set(json.ditheringWorldExponent)
    if (matches.number.test(json.ditheringLocalDistance))
      component.ditheringLocalDistance.set(json.ditheringLocalDistance)
    if (matches.number.test(json.ditheringLocalExponent))
      component.ditheringLocalExponent.set(json.ditheringLocalExponent)
    if (matchesVector3.test(json.worldCenter)) component.worldCenter.set(new Vector3().copy(json.worldCenter))
    if (matchesVector3.test(json.localCenter)) component.localCenter.set(new Vector3().copy(json.localCenter))
    if (matches.boolean.test(json.useWorldCenter)) component.useWorldCenter.set(json.useWorldCenter)
    if (matches.boolean.test(json.useLocalCenter)) component.useLocalCenter.set(json.useLocalCenter)
    if (matches.boolean.test(json.overrideFaceCulling)) component.overrideFaceCulling.set(json.overrideFaceCulling)
  },

  /**@todo refactor this reactor and when we call obc function */
  reactor: () => {
    const entity = useEntityContext()
    const modelComponent = useComponent(entity, ModelComponent)
    const entityComponent = useComponent(entity, EntityTreeComponent)
    const useBasicMaterials = useHookstate(getMutableState(RendererState).forceBasicMaterials)
    const transparencyDitheringComponent = useComponent(entity, TransparencyDitheringComponent)
    /** Injects dithering logic into avatar materials */
    useEffect(() => {
      const {
        ditheringWorldExponent,
        ditheringWorldDistance,
        ditheringLocalDistance,
        ditheringLocalExponent,
        worldCenter,
        localCenter,
        useWorldCenter,
        useLocalCenter,
        matIds,
        overrideFaceCulling
      } = getComponent(entity, TransparencyDitheringComponent)
      const ditherComponent = getComponent(entity, TransparencyDitheringComponent)
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
            ditheringWorldExponent,
            ditheringWorldDistance,
            ditheringLocalDistance,
            ditheringLocalExponent,
            worldCenter,
            localCenter,
            useWorldCenter,
            useLocalCenter,
            overrideFaceCulling
          )
          if (!material.shader) return
          if (material.shader.uniforms.useWorldCenter) material.shader.uniforms.useWorldCenter.value = useWorldCenter
          if (material.shader.uniforms.useLocalCenter) material.shader.uniforms.useLocalCenter.value = useLocalCenter
          if (material.shader.uniforms.ditheringWorldDistance)
            material.shader.uniforms.ditheringWorldDistance.value = ditheringWorldDistance
          if (material.shader.uniforms.ditheringWorldExponent)
            material.shader.uniforms.ditheringWorldExponent.value = ditheringWorldExponent
          if (material.shader.uniforms.ditheringLocalDistance)
            material.shader.uniforms.ditheringLocalDistance.value = ditheringLocalDistance
          if (material.shader.uniforms.ditheringLocalExponent)
            material.shader.uniforms.ditheringLocalExponent.value = ditheringLocalExponent
        }
      })
    }, [
      modelComponent.scene,
      entityComponent.children,
      useBasicMaterials,
      transparencyDitheringComponent.worldCenter,
      transparencyDitheringComponent.localCenter,
      transparencyDitheringComponent.useWorldCenter,
      transparencyDitheringComponent.useLocalCenter,
      transparencyDitheringComponent.ditheringWorldDistance,
      transparencyDitheringComponent.ditheringWorldExponent
    ])
    return null
  }
})

const injectDitheringLogic = (
  material: Material,
  ditheringWorldExponent: number,
  ditheringWorldDistance: number,
  ditheringLocalDistance: number,
  ditheringLocalExponent: number,
  worldCenter: Vector3,
  localCenter: Vector3,
  useWorldCenter: boolean,
  useLocalCenter: boolean,
  overrideCulling: boolean
) => {
  material.alphaTest = 0.5
  if (overrideCulling) material.side = FrontSide
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
      shader.uniforms.ditheringWorldCenter = {
        value: worldCenter
      }
      shader.uniforms.ditheringLocalCenter = {
        value: localCenter
      }
      shader.uniforms.ditheringWorldExponent = { value: ditheringWorldExponent }
      shader.uniforms.ditheringWorldDistance = { value: ditheringWorldDistance }
      shader.uniforms.ditheringLocalExponent = { value: ditheringLocalExponent }
      shader.uniforms.ditheringLocalDistance = { value: ditheringLocalDistance }
      shader.uniforms.useLocalCenter = { value: useLocalCenter }
      shader.uniforms.useWorldCenter = { value: useWorldCenter }
      shader.uniforms.worldCenter = { value: worldCenter }
      shader.uniforms.localCenter = { value: localCenter }
      material.shader = shader
    }
  })
}
