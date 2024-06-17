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

import {
  defineComponent,
  defineQuery,
  getComponent,
  PresentationSystemGroup,
  useEntityContext
} from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getState } from '@etherealengine/hyperflux'
import { generateNoiseTexture } from '@etherealengine/spatial/src/renderer/functions/generateNoiseTexture'

import { useEffect } from 'react'
import { MaterialStateComponent } from '../../MaterialComponent'
import { setPlugin } from '../../materialFunctions'

export type NoiseOffsetParameters = {
  textureSize: Uniform
  frequency: Uniform
  noiseTexture: Uniform
  time: Uniform
  offsetAxis: Uniform
}

export const NoiseOffsetPlugin = defineComponent({
  name: 'NoiseOffsetPlugin',
  onInit: (entity) => {
    return {
      textureSize: new Uniform(64),
      frequency: new Uniform(0.00025),
      amplitude: new Uniform(0.005),
      noiseTexture: new Uniform(generateNoiseTexture(64)),
      offsetAxis: new Uniform(new Vector3(0, 1, 0)),
      time: new Uniform(0)
    }
  },
  reactor: () => {
    const entity = useEntityContext()
    useEffect(() => {
      const materialComponent = getComponent(entity, MaterialStateComponent)
      const callback = (shader) => {
        const plugin = getComponent(entity, NoiseOffsetPlugin)

        shader.uniforms.textureSize = plugin.textureSize
        shader.uniforms.frequency = plugin.frequency
        shader.uniforms.amplitude = plugin.amplitude
        shader.uniforms.noiseTexture = plugin.noiseTexture
        shader.uniforms.offsetAxis = plugin.offsetAxis
        shader.uniforms.time = plugin.time

        shader.vertexShader = shader.vertexShader.replace(
          'void main() {',
          `
            uniform sampler2D noiseTexture;
            uniform float textureSize; // The width of a slice
            uniform float frequency;
            uniform float amplitude;
            uniform float time;
    
            vec3 sampleNoise(vec3 pos) {
                float zSlice = (pos.z * textureSize);
                vec2 slicePos = vec2(zSlice / textureSize, fract(zSlice / textureSize));
                vec2 noisePos = slicePos + pos.xy / textureSize;
                return vec3(texture2D(noiseTexture, noisePos).r);
            }
    
            vec3 turbulence(vec3 position) {
              vec3 sum = vec3(0.0);
              float frequencyMutliplied = frequency;
              float amplitudeMultiplied = amplitude;
    
              for (int i = 0; i < 4; i++) {
                  vec3 p = position * frequencyMutliplied;
                  p.z += time * 0.0015;
    
                  sum += sampleNoise(p).rgb * amplitudeMultiplied;
              
                  frequencyMutliplied *= 2.0;
                  amplitudeMultiplied *= 7.0;
              }
            
              return sum;
            }
    
            void main() {
          `
        )
        shader.vertexShader = shader.vertexShader.replace(
          'void main() {',
          `uniform vec3 offsetAxis;
        void main() {`
        )
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
            #include <begin_vertex>
            vec4 noiseWorldPosition = vec4(transformed, 1.0);
            noiseWorldPosition = modelMatrix * noiseWorldPosition;
            #ifdef USE_INSTANCING
              noiseWorldPosition = instanceMatrix * noiseWorldPosition;
            #endif
            vec3 offset = turbulence(noiseWorldPosition.xyz) * offsetAxis;
            transformed += offset;
          `
        )
      }
      setPlugin(materialComponent.material as Material, callback)
    })
    return null
  }
})

const noisePluginQuery = defineQuery([NoiseOffsetPlugin])
const execute = () => {
  for (const entity of noisePluginQuery()) {
    const noisePlugin = getComponent(entity, NoiseOffsetPlugin)
    const elapsedSeconds = getState(ECSState).elapsedSeconds
    noisePlugin.time.value = elapsedSeconds
  }
}

export const NoiseOffsetSystem = defineSystem({
  uuid: 'ee.spatial.material.NoiseOffsetSystem',
  insert: { before: PresentationSystemGroup },
  execute
})
