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

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useEffect } from 'react'
import { LinearMipmapLinearFilter, RepeatWrapping, Texture, Vector2 } from 'three'
import { defineMaterialPlugin, TextureSchema } from '../defineMaterialPlugin'

// Triplanar shader chunks
const triplanarVertexPars = `
varying vec3 vPosition;
varying vec3 vLocalPosition;
varying vec3 vWorldNormal;
// We'll use the existing vNormal from Three.js
`

const triplanarVertex = `
vPosition = position;
vLocalPosition = position; // Use local position for texture mapping
vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
// vNormal is already set by Three.js
`

const triplanarFragmentPars = `
varying vec3 vPosition;
varying vec3 vLocalPosition;
varying vec3 vWorldNormal;
// vNormal is already defined by Three.js

uniform sampler2D diffuseMap1;
uniform sampler2D diffuseMap2;
uniform sampler2D diffuseMap3;
uniform sampler2D normalMap1;
uniform sampler2D normalMap2;
uniform sampler2D normalMap3;

uniform vec2 texScale1;
uniform vec2 texScale2;
uniform vec2 texScale3;

uniform float blendSharpness;
uniform float normalScale;
uniform float peakHeight;

// Triplanar texture mapping function with distance compensation
vec4 triplanarMapping(vec3 pos, vec3 normal, sampler2D tex, vec2 texScale) {
  // Absolute value of normal components for blending weights
  vec3 blending = pow(abs(normal), vec3(blendSharpness));
  blending = blending / (blending.x + blending.y + blending.z);

  // Calculate consistent texture coordinates using local position
  // This approach maintains consistent scale regardless of world position
  vec2 uvX = pos.yz * texScale;
  vec2 uvY = pos.xz * texScale;
  vec2 uvZ = pos.xy * texScale;

  // Sample texture from three directions
  vec4 xaxis = texture2D(tex, uvX);
  vec4 yaxis = texture2D(tex, uvY);
  vec4 zaxis = texture2D(tex, uvZ);

  // Blend samples based on normal
  return xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
}
`

const triplanarFragment = `
// Use the world normal we computed in vertex shader
vec3 worldNormal = normalize(vWorldNormal);

// Calculate height factor (Y component of local position)
float height = vLocalPosition.y;
// Use blendSharpness to control transition sharpness at peak height
// When blendSharpness is high (close to 1), creates a sharp transition
// When blendSharpness is low (close to 0), creates a smooth transition
float transitionRange = (1.0 - blendSharpness) * peakHeight;
float minHeight = max(0.0, peakHeight - transitionRange);
float heightFactor = smoothstep(minHeight, peakHeight, height);

// Calculate slope factor (0 = flat, 1 = vertical)
float slope = 1.0 - worldNormal.y;
float slopeFactor = smoothstep(0.0, 0.8, slope);

// Sample textures using triplanar mapping with local position
vec4 diffuse1 = triplanarMapping(vLocalPosition, worldNormal, diffuseMap1, texScale1); // Valleys
vec4 diffuse2 = triplanarMapping(vLocalPosition, worldNormal, diffuseMap2, texScale2); // Slopes
vec4 diffuse3 = triplanarMapping(vLocalPosition, worldNormal, diffuseMap3, texScale3); // Peaks

// First blend between valley (diffuse1) and slope (diffuse2) based on slope
vec4 valleyAndSlope = mix(diffuse1, diffuse2, slopeFactor);

// Then blend with peaks (diffuse3) based on height
vec4 finalDiffuse = mix(valleyAndSlope, diffuse3, heightFactor);

// Apply to material
diffuseColor *= finalDiffuse;
`

export const TriplanarMappingMaterialPlugin = defineMaterialPlugin({
  name: 'TriplanarMappingMaterialPlugin',

  jsonID: 'IR_triplanar_mapping',

  uniforms: S.Object({
    diffuseMap1: TextureSchema(),
    diffuseMap2: TextureSchema(),
    diffuseMap3: TextureSchema(),
    normalMap1: TextureSchema(),
    normalMap2: TextureSchema(),
    normalMap3: TextureSchema(),
    texScale1: T.Vec2(new Vector2(0.1, 0.1)),
    texScale2: T.Vec2(new Vector2(0.1, 0.1)),
    texScale3: T.Vec2(new Vector2(0.1, 0.1)),
    blendSharpness: S.Number({ default: 2.0 }),
    normalScale: S.Number({ default: 1.0 }),
    peakHeight: S.Number({ default: 10.0 })
  }),

  onApply(shader) {
    // Add vertex shader modifications
    shader.vertexShader = shader.vertexShader.replace(/#include <common>/, '#include <common>\n' + triplanarVertexPars)

    shader.vertexShader = shader.vertexShader.replace(
      /#include <worldpos_vertex>/,
      '#include <worldpos_vertex>\n' + triplanarVertex
    )

    // Add fragment shader modifications
    shader.fragmentShader = shader.fragmentShader.replace(
      /#include <common>/,
      '#include <common>\n' + triplanarFragmentPars
    )

    // Apply triplanar mapping after the map_fragment include
    shader.fragmentShader = shader.fragmentShader.replace(
      /#include <map_fragment>/,
      '#include <map_fragment>\n' + triplanarFragment
    )
  },

  update: undefined,

  reactor: ({ textureState }) => {
    const textures = textureState.get(NO_PROXY) as Record<string, Texture>

    useEffect(() => {
      if (!textures.diffuseMap1) return
      textures.diffuseMap1.wrapS = RepeatWrapping
      textures.diffuseMap1.wrapT = RepeatWrapping
      textures.diffuseMap1.minFilter = LinearMipmapLinearFilter
      textures.diffuseMap1.needsUpdate = true
    }, [textureState.diffuseMap1])

    useEffect(() => {
      if (!textures.diffuseMap2) return
      textures.diffuseMap2.wrapS = RepeatWrapping
      textures.diffuseMap2.wrapT = RepeatWrapping
      textures.diffuseMap2.minFilter = LinearMipmapLinearFilter
      textures.diffuseMap2.needsUpdate = true
    }, [textureState.diffuseMap2])

    useEffect(() => {
      if (!textures.diffuseMap3) return
      textures.diffuseMap3.wrapS = RepeatWrapping
      textures.diffuseMap3.wrapT = RepeatWrapping
      textures.diffuseMap3.minFilter = LinearMipmapLinearFilter
      textures.diffuseMap3.needsUpdate = true
    }, [textureState.diffuseMap3])
  }
})
