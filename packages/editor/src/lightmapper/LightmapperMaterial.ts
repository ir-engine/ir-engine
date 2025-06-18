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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

// LightmapperMaterial implementation
// https://github.com/lucas-jones/three-lightmap-baker

import { Matrix4, ShaderMaterial, Texture, Vector3 } from 'three'
import { MeshBVH, MeshBVHUniformStruct, shaderIntersectFunction, shaderStructs } from 'three-mesh-bvh'

export type LightmapperMaterialOptions = {
  bvh: MeshBVH
  invModelMatrix: Matrix4

  positions: Texture
  normals: Texture

  casts: number

  lightPosition: Vector3
  lightSize: number

  opacity: number
  sampleIndex: number

  directLightEnabled: boolean
  indirectLightEnabled: boolean
  ambientLightEnabled: boolean
  ambientDistance: number
}

export class LightmapperMaterial extends ShaderMaterial {
  constructor(options: LightmapperMaterialOptions) {
    const bvhUniformStruct = new MeshBVHUniformStruct()
    bvhUniformStruct.updateFrom(options.bvh)

    super({
      transparent: true,

      uniforms: {
        bvh: { value: bvhUniformStruct },
        positions: { value: options.positions },
        normals: { value: options.normals },
        invModelMatrix: { value: options.invModelMatrix },
        casts: { value: options.casts },
        lightPosition: { value: options.lightPosition },
        lightSize: { value: options.lightSize },
        opacity: { value: 1 },
        sampleIndex: { value: 0 },
        directLightEnabled: { value: options.directLightEnabled },
        indirectLightEnabled: { value: options.indirectLightEnabled },
        ambientLightEnabled: { value: options.ambientLightEnabled },
        ambientDistance: { value: options.ambientDistance }
      },

      vertexShader: /* glsl */ `
                varying vec2 vUv;
                void main() {
                    gl_Position = vec4( position, 1.0 );
                    vUv = uv;
                }
            `,

      fragmentShader: /* glsl */ `
    precision highp isampler2D;
    precision highp usampler2D;
    ${shaderStructs}
    ${shaderIntersectFunction}

    uniform mat4 invModelMatrix;
    uniform sampler2D positions;
    uniform sampler2D normals;
    uniform int casts;

    uniform vec3 lightPosition;
    uniform float lightSize;
    uniform int sampleIndex;
        
    uniform bool directLightEnabled;
    uniform bool indirectLightEnabled;
    uniform bool ambientLightEnabled;
    uniform float ambientDistance;
    uniform float opacity;
        
    uniform BVH bvh;
    varying vec2 vUv;
        
    uvec4 s0;
    void rng_initialize(vec2 p, int frame) {
        // white noise seed
        s0 = uvec4( p, uint( frame ), uint( p.x ) + uint( p.y ) );
    }
        
    void pcg4d( inout uvec4 v ) {
        v = v * 1664525u + 1013904223u;
        v.x += v.y * v.w;
        v.y += v.z * v.x;
        v.z += v.x * v.y;
        v.w += v.y * v.z;
        v = v ^ ( v >> 16u );
        v.x += v.y*v.w;
        v.y += v.z*v.x;
        v.z += v.x*v.y;
        v.w += v.y*v.z;
    }

    float rand() {
        pcg4d(s0);
        return float( s0.x ) / float( 0xffffffffu );
    }
    vec2 rand2() {
        pcg4d( s0 );
        return vec2( s0.xy ) / float(0xffffffffu);
    }
    vec3 rand3() {
        pcg4d(s0);
        return vec3( s0.xyz ) / float( 0xffffffffu );
    }
    vec4 rand4() {
        pcg4d(s0);
        return vec4(s0)/float(0xffffffffu);
    }
        
    vec3 randomSpherePoint(vec3 rand) {
        float ang1 = (rand.x + 1.0) * 3.1415; // [-1..1) -> [0..2*PI)
        float u = rand.y; // [-1..1), cos and acos(2v-1) cancel each other out, so we arrive at [-1..1)
        float u2 = u * u;
        float sqrt1MinusU2 = sqrt(1.0 - u2);
        float x = sqrt1MinusU2 * cos(ang1);
        float y = sqrt1MinusU2 * sin(ang1);
        float z = u;
        return vec3(x, y, z);
      }
        
      vec3 getHemisphereSample( vec3 n, vec2 uv ) {
        // https://www.rorydriscoll.com/2009/01/07/better-sampling/
        // https://graphics.pixar.com/library/OrthonormalB/paper.pdf
        float sign = n.z == 0.0 ? 1.0 : sign( n.z );
        float a = - 1.0 / ( sign + n.z );
        float b = n.x * n.y * a;
        vec3 b1 = vec3( 1.0 + sign * n.x * n.x * a, sign * b, - sign * n.x );
        vec3 b2 = vec3( b, sign + n.y * n.y * a, - n.y );
        float r = sqrt( uv.x );
        float theta = 2.0 * 3.1415 * uv.y;
        float x = r * cos( theta );
        float y = r * sin( theta );
        return x * b1 + y * b2 + sqrt( 1.0 - uv.x ) * n;
    }
        
    void main() {
        vec4 position = texture2D(positions, vUv);
        vec4 normal = texture2D(normals, vUv);

        rng_initialize( gl_FragCoord.xy, sampleIndex );

        vec3 rayOrigin = vec3(position.r, position.g, position.b);
        vec3 rayDirection = vec3(normal.r, normal.g, normal.b);
        
        rayOrigin += rayDirection * 0.001;

        uvec4 faceIndices = uvec4( 0u );
        vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
        vec3 barycoord = vec3( 0.0 );
        float side = 1.0;
        float dist = 0.0;
        
        vec3 totalIndirectLight = vec3(0.0);
        vec3 totalAO = vec3(0.0);
        vec3 totalDirectLight = vec3(0.0);

        if(ambientLightEnabled || indirectLightEnabled) {
            for ( int i = 0; i < casts; i++ ) {
                vec3 newDirection = getHemisphereSample(normal.xyz, rand4().xy);

                if(dot(rayDirection, newDirection) > 0.0) {
                    bool hit = bvhIntersectFirstHit( bvh, rayOrigin, newDirection, faceIndices, faceNormal, barycoord, side, dist );
        
                    if(!hit) {
                        totalIndirectLight.r += 1.0;
                        totalIndirectLight.g += 1.0;
                        totalIndirectLight.b += 1.0;
                    }
        
                    if(!hit || dist > ambientDistance) {
                        totalAO.r += 1.0;
                        totalAO.g += 1.0;
                        totalAO.b += 1.0;
                    }
                }
            }
        }

        if(directLightEnabled) {
            for ( int i = 0; i < casts; i++ ) {
                vec3 newDirection = lightPosition - (rayOrigin + randomSpherePoint(rand3() * 0.05) * lightSize);

                newDirection = normalize(newDirection);
                bool hit = bvhIntersectFirstHit( bvh, rayOrigin, newDirection, faceIndices, faceNormal, barycoord, side, dist );

                if(!hit) {
                    totalDirectLight.r += 1.0;
                    totalDirectLight.g += 1.0;
                    totalDirectLight.b += 1.0;
                }
            }
        }

        vec4 averageDirectLight = vec4(totalDirectLight / float(casts), 1.0);
        vec4 averageAO = vec4(totalAO / float(casts), 1.0);
        vec4 averageIndirectLight = vec4(totalIndirectLight / float(casts), 1.0);
        
        float multiplier = directLightEnabled && indirectLightEnabled ? 0.5 : 1.0;
        
        vec4 finalColor = vec4(0.0);
        
        if(directLightEnabled) {
            finalColor += averageDirectLight * multiplier;
        }
        
        if(indirectLightEnabled) {
            finalColor += averageIndirectLight * multiplier;
        }
        
        if(ambientLightEnabled) {
            if(!directLightEnabled && !indirectLightEnabled) {
                finalColor = averageAO;
            } else {
                finalColor *= averageAO;
            }
        }

        finalColor.a = opacity;
        
        gl_FragColor = finalColor;
    }
    `
    })
  }
}
