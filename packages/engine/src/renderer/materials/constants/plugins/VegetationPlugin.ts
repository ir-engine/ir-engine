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
