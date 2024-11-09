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

import { FrontSide, Material, Uniform, Vector3 } from 'three'

import { defineComponent, getComponent, getOptionalComponent, useComponent, useEntityContext } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { setPlugin } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { useEffect } from 'react'
import {
  ditheringAlphatestChunk,
  ditheringFragUniform,
  ditheringVertex,
  ditheringVertexUniform
} from './ditherShaderChunk'

export enum ditherCalculationType {
  worldTransformed = 1,
  localPosition = 0
}

export const MAX_DITHER_POINTS = 2 //should be equal to the length of the vec3 array in the shader

export const TransparencyDitheringRootComponent = defineComponent({
  name: 'TransparencyDitheringRootComponent',
  schema: S.Object({ materials: S.Array(S.EntityUUID()) })
})

export const TransparencyDitheringPluginComponent = defineComponent({
  name: 'TransparencyDitheringPluginComponent',
  schema: S.NonSerialized(
    S.Object({
      centers: S.Class(() => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => new Vector3()))),
      exponents: S.Class(() => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => 1))),
      distances: S.Class(() => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => 1))),
      useWorldCalculation: S.Class(
        () => new Uniform(Array.from({ length: MAX_DITHER_POINTS }, () => ditherCalculationType.worldTransformed))
      )
    })
  ),

  reactor: () => {
    const entity = useEntityContext()
    const material = useComponent(entity, MaterialStateComponent).material
    useEffect(() => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
      if (!materialComponent) return
      const material = materialComponent.material as Material
      const callback = (shader) => {
        //this auto-injects alphaTest into the shader but causes a race condition with the injecting the ditheringAlphatestChunk
        // material.alphaTest = 0.5
        material.side = FrontSide
        const plugin = getComponent(entity, TransparencyDitheringPluginComponent)

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
      }
      setPlugin(materialComponent.material as Material, callback)
    }, [material])
    return null
  }
})
