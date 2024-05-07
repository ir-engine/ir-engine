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
import { Uniform } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import {
  getComponent,
  getOptionalComponent,
  PresentationSystemGroup,
  setComponent,
  useComponent
} from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { generateNoiseTexture } from '@etherealengine/spatial/src/renderer/functions/generateNoiseTexture'
import { PluginObjectType } from '../../../../common/functions/OnBeforeCompilePlugin'
import { MaterialComponent, MaterialComponents, pluginByName } from '../../MaterialComponent'

export const NoiseOffsetPlugin: PluginObjectType = {
  id: 'noiseOffset',
  priority: 0.4,
  compile: (shader, renderer) => {
    const pluginEntity = pluginByName[NoiseOffsetPlugin.id]
    const plugin = getComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin])
    if (!plugin || !plugin.parameters) return
    const parameters = plugin.parameters!
    shader.uniforms['textureSize'] = new Uniform(parameters.textureSize)
    shader.uniforms['noiseTexture'] = new Uniform(parameters.noiseTexture)
    shader.uniforms['frequency'] = new Uniform(parameters.frequency)
    const elapsedSeconds = getState(ECSState).elapsedSeconds
    setComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin]), { parameters: { time: elapsedSeconds } }
    shader.uniforms['time'] = plugin.parameters['time']
    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `
        uniform sampler2D noiseTexture;
        uniform float textureSize; // The width of a slice
        uniform float frequency;
        uniform float time;

        vec3 sampleNoise(vec3 pos) {
            float zSlice = floor(pos.z * textureSize);
            vec2 slicePos = vec2(zSlice / textureSize, fract(zSlice / textureSize));
            vec2 noisePos = slicePos + pos.xy / textureSize;
            return vec3(texture2D(noiseTexture, noisePos).r);
        }

        vec3 turbulence(vec3 position) {
          vec3 sum = vec3(0.0);
          float frequency = 0.01;
          float amplitude = 0.5;

          for (int i = 0; i < 4; i++) {
              vec3 p = position * frequency;
              p.z += time * 0.002;
              p = fract(p);
          
              sum += sampleNoise(p).rgb * amplitude;
          
              frequency *= 2.0;
              amplitude *= 0.5;
          }
        
          return sum;
        }

        void main() {
      `
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
        #include <begin_vertex>
        float yMagnitude = smoothstep(0.2, 0.7, position.y);
        vec4 noiseWorldPosition = vec4(transformed, 1.0);
        noiseWorldPosition = modelMatrix * noiseWorldPosition;
        #ifdef USE_INSTANCING
          noiseWorldPosition = instanceMatrix * noiseWorldPosition;
        #endif
        vec3 offset = turbulence(noiseWorldPosition.xyz) * 1.0;
        offset.y *= 0.2;
        //offset *= yMagnitude;
        transformed += offset;
      `
    )
  }
}

const execute = () => {
  const plugin = getOptionalComponent(pluginByName[NoiseOffsetPlugin.id], MaterialComponent[MaterialComponents.Plugin])
  if (!plugin || !plugin.parameters || !plugin.parameters['noiseTexture']) return

  const elapsedSeconds = getState(ECSState).elapsedSeconds
  plugin.parameters.time.set(elapsedSeconds)
}

const reactor = () => {
  if (!isClient) return null

  const noiseOffset = useComponent(pluginByName[NoiseOffsetPlugin.id], MaterialComponent[MaterialComponents.Plugin])

  useEffect(() => {
    if (!noiseOffset?.value || noiseOffset.parameters['noiseTexture']) return

    // Create new Perlin noise instance
    const noiseTexture = generateNoiseTexture(noiseOffset.parameters['textureSize'].value)
    noiseOffset.parameters['noiseTexture'].set(noiseTexture)
  }, [noiseOffset])

  return null
}

export const NoiseOffsetSystem = defineSystem({
  uuid: 'ee.spatial.material.NoiseOffsetSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
