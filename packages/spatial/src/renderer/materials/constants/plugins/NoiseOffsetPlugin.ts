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

import { Uniform, Vector3 } from 'three'

import { getComponent, getOptionalComponent, PresentationSystemGroup } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getState } from '@etherealengine/hyperflux'
import { generateNoiseTexture } from '@etherealengine/spatial/src/renderer/functions/generateNoiseTexture'

import { PluginObjectType } from '../../../../common/functions/OnBeforeCompilePlugin'
import { MaterialComponent, MaterialComponents, pluginByName } from '../../MaterialComponent'
import { applyPluginShaderParameters } from '../../materialFunctions'

export type NoiseOffsetParameters = {
  textureSize: Uniform
  frequency: Uniform
  noiseTexture: Uniform
  time: Uniform
  offsetAxis: Uniform
}

export const NoiseOffsetPlugin: PluginObjectType = {
  id: 'noiseOffset',
  priority: 0.4,
  compile: (shader, renderer) => {
    const pluginEntity = pluginByName[NoiseOffsetPlugin.id]
    const plugin = getComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin])
    if (!plugin || !plugin.parameters) return
    applyPluginShaderParameters(pluginEntity, shader, {
      textureSize: 64,
      frequency: 0.00025,
      amplitude: 0.005,
      noiseTexture: generateNoiseTexture(64),
      offsetAxis: new Vector3(0, 1, 0),
      time: 0
    })

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
}

const execute = () => {
  const plugin = getOptionalComponent(pluginByName[NoiseOffsetPlugin.id], MaterialComponent[MaterialComponents.Plugin])
  if (!plugin || !plugin.parameters) return
  for (const key in plugin.parameters) {
    const parameters = plugin.parameters[key] as NoiseOffsetParameters
    const elapsedSeconds = getState(ECSState).elapsedSeconds
    parameters.time.value = elapsedSeconds
  }
}

export const NoiseOffsetSystem = defineSystem({
  uuid: 'ee.spatial.material.NoiseOffsetSystem',
  insert: { before: PresentationSystemGroup },
  execute
})
