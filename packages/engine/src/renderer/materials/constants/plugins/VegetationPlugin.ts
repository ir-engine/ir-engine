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

import { getMutableState, NO_PROXY } from '@etherealengine/hyperflux'

import { MaterialPluginType } from '../../components/MaterialPluginComponent'
import { SourceType } from '../../components/MaterialSource'
import { MaterialLibraryState } from '../../MaterialLibrary'

const NUM_AVATARS = 8

const VegetationPlugin: MaterialPluginType = {
  plugin: {
    id: 'vegetation',
    priority: 0.5,
    compile: (shader, renderer) => {
      const plugin = getMutableState(MaterialLibraryState).plugins['vegetation']
      const parameters = plugin.parameters.get(NO_PROXY)

      shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `
  float distanceSquared(vec3 v1, vec3 v2) {
    vec3 diff = v1 - v2;
    return dot(diff, diff);
  }

  uniform vec3 avatarPositions[${NUM_AVATARS}];
  void main() {`
      )

      //bend geo away from avatars
      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        float avatarDistance = 100000.0;
        int avatarIndex = -1;
        for (int i = 0; i < ${NUM_AVATARS}; i++) {
          float distance = distanceSquared(avatarPositions[i], worldPosition.xyz);
          if (distance < avatarDistance) {
            avatarDistance = distance;
            avatarIndex = i;
          }
        }
        if (avatarIndex > -1) {
          float magnitude = smoothstep(0.0, 1.0, 1.0 - avatarDistance) * 10.0;
          vec3 offset = normalize(worldPosition.xyz - avatarPositions[avatarIndex]) * magnitude * 0.5;
          transformed += offset;
          mvPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            mvPosition = instanceMatrix * mvPosition;
          #endif
          mvPosition = modelViewMatrix * mvPosition;
          gl_Position = projectionMatrix * mvPosition;
        }
       `
      )

      shader.uniforms.avatarPositions = new Uniform(parameters.avatarPositions)
    }
  },
  parameters: {
    avatarPositions: [] as Vector3[]
  },
  instances: [] as Material[],
  src: {
    type: SourceType.BUILT_IN,
    path: ''
  }
}

export { VegetationPlugin }
