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

import { Material, Uniform, Vector3 } from 'three'

import { defineComponent, EntityUUID, getComponent, useEntityContext } from '@etherealengine/ecs'
import { MaterialComponent, MaterialComponents } from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'

import { addOBCPlugin } from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { useEffect } from 'react'
import {
  ditheringAlphatestChunk,
  ditheringFragUniform,
  ditheringVertex,
  ditheringVertexUniform
} from '../functions/ditherShaderChunk'

export enum ditherCalculationType {
  worldTransformed = 1,
  localPosition = 0
}

export const MAX_DITHER_POINTS = 4 //should be equal to the length of the vec3 array in the shader

export const TransparencyDitheringRoot = defineComponent({
  name: 'TransparencyDitheringRoot',
  onInit: (entity) => {
    return { materials: [] as EntityUUID[] }
  },
  onSet: (entity, component, json) => {
    if (json?.materials) component.materials.set(json.materials)
  }
})

export const TransparencyDitheringPlugin = defineComponent({
  name: 'TransparencyDithering',
  onInit: (entity) => {
    return {
      centers: new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => new Vector3())),
      exponents: new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => 2)),
      distances: new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => 3)),
      useWorldCalculation: new Uniform(
        Array.from({ length: MAX_DITHER_POINTS }, () => ditherCalculationType.worldTransformed)
      )
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const materialComponent = getComponent(entity, MaterialComponent[MaterialComponents.State])
    const material = materialComponent.material as Material
    useEffect(() => {
      addOBCPlugin(material, (shader) => {
        const plugin = getComponent(entity, TransparencyDitheringPlugin)

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
        shader.uniforms.centers = plugin.centers
        shader.uniforms.exponents = plugin.exponents
        shader.uniforms.distances = plugin.distances
        shader.uniforms.useWorldCalculation = plugin.useWorldCalculation
      })
    })
    return null
  }
})
