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

import { Matrix4, ShaderMaterial, Uniform, Vector3 } from 'three'
import LogarithmicDepthBufferMaterialChunk from '../../scene/functions/LogarithmicDepthBufferMaterialChunk'
import { generateNoiseTexture } from '../materials/functions/generateNoiseTexture'

const SDFShader = {
  shader: new ShaderMaterial({
    vertexShader: `
    #ifdef USE_FOG
      varying float vFogDepth;
    #endif
    varying vec2 vUv;
    
    uniform float near;
    uniform float far;
    #include <logdepthbuf_pars_vertex>
    ${LogarithmicDepthBufferMaterialChunk}
   
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
     
      #include <logdepthbuf_vertex>
      #ifdef USE_FOG
        vFogDepth = (modelViewMatrix * vec4(position, 1.0)).z;
      #endif
    }`,
    fragmentShader: `
    precision mediump float;
    uniform sampler2D inputBuffer;
    varying float vLogDepth;
    uniform sampler2D noiseTexture;
    uniform sampler2D uDepth;
    uniform vec3 cameraPos;
    uniform mat4 cameraMatrix;
    uniform float uTime;
    uniform float fov;
    uniform float aspectRatio;
    uniform float near;
    uniform float far;
    uniform vec3 uColor;
    uniform bool useFog;
    uniform bool two;
    uniform vec3 scale;
    uniform vec3 torusPosition;
    uniform vec3 lightDirection;
    varying vec2 vUv;
    varying float vViewZ;
    #include <logdepthbuf_pars_fragment>

    #define MAX_STEPS 100
    #define MIN_DIST 0.001
    #define MAX_DIST 5000.0

    vec3 torus(vec3 p, vec2 t) {
      float angle = uTime;
      float c = cos(angle);
      float s = sin(angle);
      mat3 rotationMatrix = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
      p = rotationMatrix * p;

      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return vec3(length(q) - t.y, q.y, 0.0);
 
    }
    vec3 torus2(vec3 p, vec2 t) {
      float angle = -uTime;
      float c = cos(angle);
      float s = sin(angle);
      mat3 rotationMatrix = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
      p = rotationMatrix * p;

      vec2 q = vec2(length(p.xz) - t.x, p.y);
      return vec3(length(q) - t.y, q.y, 0.0);
 
    }

    float cloudShape(vec3 p) {
      float textureSize = 128.0;
  
      // Adjust the scale as needed for your noise
      vec3 thisScale = scale;
  
      // Create a new variable for the transformed position
      vec3 transformedP = p;
  
      // Apply a time-based transformation to transformedP with more complexity
      transformedP.x += sin(uTime + sin(uTime * 0.27) * 0.5) * 5.0;
      transformedP.y += cos(uTime + cos(uTime * 0.33) * 0.3) * 5.0;
      transformedP.z += sin(uTime + sin(uTime * 0.22) * 0.4) * 5.0;
  
      // Scale transformedP to fit within the texture coordinates
      vec3 scaledP = transformedP * thisScale;
  
      // Calculate the slice of the 3D texture we need to sample
      float sliceSize = 1.0 / textureSize;
      float slice = floor(scaledP.z * textureSize);
  
      // Calculate 2D texture coordinates
      float x = scaledP.x - floor(scaledP.x); // Wrap around x
      float y = (scaledP.y - floor(scaledP.y)) + slice * sliceSize; // Add the slice offset
  
      // Sample the noise texture
      float density = texture2D(noiseTexture, vec2(x, y)).r;
  
      // Adjust density as needed
      return density * 0.025;
  } 

    vec4 rayMarchClouds(vec3 ro, vec3 rd) {
      float d = 0.0;
      vec4 accumulatedColor = vec4(0.0); // Initialize with transparent black
      for (int i = 0; i < MAX_STEPS && d < MAX_DIST; i++) {
          vec3 p = ro + rd * d;

          float depthFromCamera = length(p - cameraPos);

          // Sample the depth texture using screen space coordinates
          float depthFromTexture = texture2D(uDepth, vUv).r * 10.0;

          if (depthFromCamera > depthFromTexture) {
              // Skip this pixel if the depth from the camera is greater than the depth from the texture
              break;
          }

          float density = cloudShape(p);
  
          // Adjust threshold and step size as needed
          if (density > 0.001) { // Example threshold
              vec3 cloudColor = vec3(1.0, 1.0, 1.0); // Define cloud color
              float alpha = density; // Use density as alpha value
  
              // Accumulate color and alpha
              accumulatedColor += vec4(cloudColor * alpha, alpha) * (1.0 - accumulatedColor.a);
          }
  
          d += 0.1; // Example step size
        }
        return accumulatedColor;
    }
  

    float shortestDistanceToTorus(vec3 ro, vec2 t) {
      return torus(ro, t).x;
    }
    float shortestDistanceToTorus2(vec3 ro, vec2 t) {
      return torus2(ro, t).x;
    }
    vec3 estimateNormal(vec3 p, vec2 torusParams) {
      float epsilon = 0.001; // Adjust
      return normalize(vec3(
        shortestDistanceToTorus(p + vec3(epsilon, 0.0, 0.0), torusParams) - shortestDistanceToTorus(p - vec3(epsilon, 0.0, 0.0), torusParams),
        shortestDistanceToTorus(p + vec3(0.0, epsilon, 0.0), torusParams) - shortestDistanceToTorus(p - vec3(0.0, epsilon, 0.0), torusParams),
        shortestDistanceToTorus(p + vec3(0.0, 0.0, epsilon), torusParams) - shortestDistanceToTorus(p - vec3(0.0, 0.0, epsilon), torusParams)
      ));
    }
    vec3 estimateNormal2(vec3 p, vec2 torusParams) {
      float epsilon = 0.001; // Adjust
      return normalize(vec3(
        shortestDistanceToTorus2(p + vec3(epsilon, 0.0, 0.0), torusParams) - shortestDistanceToTorus2(p - vec3(epsilon, 0.0, 0.0), torusParams),
        shortestDistanceToTorus2(p + vec3(0.0, epsilon, 0.0), torusParams) - shortestDistanceToTorus2(p - vec3(0.0, epsilon, 0.0), torusParams),
        shortestDistanceToTorus2(p + vec3(0.0, 0.0, epsilon), torusParams) - shortestDistanceToTorus2(p - vec3(0.0, 0.0, epsilon), torusParams)
      ));
    }
    vec3 estimateNormalUnion(vec3 p, vec2 torusParams1, vec2 torusParams2) {
      float epsilon = 0.001;

      float dist1 = shortestDistanceToTorus(p, torusParams1);
      float dist2 = shortestDistanceToTorus2(p, torusParams2);  
      // Choose the closest distance field
      float closestDist = min(dist1, dist2);
  
      // Estimate the normal for the closest shape
      vec3 normal1 = estimateNormal(p + vec3(epsilon, 0.0, 0.0), torusParams1);
      vec3 normal2 = estimateNormal2(p + vec3(epsilon, 0.0, 0.0), torusParams2);
    
      vec3 closestNormal = (closestDist == dist1) ? normal1 : normal2;
    
      return normalize(closestNormal);
  }
    float opUnion(float d1, float d2) {
      return min(d1, d2);
    }
  
    vec3 rayMarchPhong(vec3 ro, vec3 rd) {
      ro=ro - torusPosition;
      float d = 0.0;
      for (int i = 0; i < MAX_STEPS && d < MAX_DIST; i++) {
          vec3 p = ro + rd * d;
          float dist = shortestDistanceToTorus(p, vec2(0.5, 0.2));
          if(two){
            dist = opUnion(shortestDistanceToTorus(p, vec2(0.5, 0.2)),shortestDistanceToTorus2(p, vec2(0.7, 0.3)));
          }
          if (dist < MIN_DIST) {
            //reconstruct depth texture to linear space
            //float cameraFar=100000.0;
            //float cameraNear=0.001;
            float depth1 = texture2D(uDepth, vUv).r*0.5;
            float linearDepth1 = exp2(depth1 * log2(1.0 + 100000.0 / 0.001)) - 1.0;
            
            // Depth testing
            if (d > linearDepth1) {
                break; // Skip this pixel if the ray is beyond the depth from the texture
            }
              // Estimate normal
              vec3 normal = estimateNormal(p, vec2(0.5, 0.2));
              // if(two){
              //   normal = estimateNormalUnion(p, vec2(0.5, 0.2), vec2(0.7, 0.3));
              // }  
              // Shading
              float cameraDist = length(p - cameraPos);
              float shade = smoothstep(0.0, 5.0, cameraDist);
  
              // Phong shading components
              vec3 ambientColor = vec3(0.2, 0.2, 0.2); // Ambient color
              vec3 diffuseColor = uColor*2.0; // Diffuse color
              vec3 specularColor = vec3(1.0, 1.0, 1.0); // Specular color
              float shininess = 32.0;
  
              vec3 normalLightDirection = normalize(lightDirection); // Light direction (adjust as needed)
  
              // Diffuse reflection
              float diffuseFactor = max(0.0, dot(normalize(normal), -normalLightDirection));
              vec3 diffuse = diffuseColor * diffuseFactor;
  
              // Specular reflection
              vec3 viewDirection = normalize(cameraPos - p);
              vec3 reflectionDirection = reflect(normalLightDirection, normalize(normal));
              float specularFactor = pow(max(0.0, dot(viewDirection, reflectionDirection)), shininess);
              vec3 specular = specularColor * specularFactor;
  
              // Final color
              vec3 phongColor = ambientColor + diffuse + specular;
              vec3 finalColor = mix(vec3(0.0), phongColor, shade);
  
              return finalColor;
          }
  
          d += dist;
      }
  
      return vec3(-1.0);
  }
 

  void main() {
    vec2 uv = vUv;

    // Adjust for aspect ratio and field of view
    float tanHalfFov = tan(radians(fov) / 2.0);
    vec3 clipSpaceDir = vec3((uv.x - 0.5) * aspectRatio * 2.0 * tanHalfFov, (uv.y - 0.5) * 2.0 * tanHalfFov, -1.0);

    // Transform clip space direction to world space
    vec3 viewDir = (cameraMatrix * vec4(clipSpaceDir, 0.0)).xyz;
    viewDir = normalize(viewDir);

    // Existing code for texture
    gl_FragColor = texture2D(inputBuffer, uv);
     
    // Ray marching with correct world space direction
    vec3 color = rayMarchPhong(cameraPos, viewDir);
    if (color != vec3(-1.0)) {
        gl_FragColor = vec4(color, 1.0);
    }
    
    
    if(useFog){
    vec4 cloudColor = rayMarchClouds(cameraPos, viewDir);

    // Get color from inputBuffer
    vec4 backgroundColor = texture2D(inputBuffer, uv);

    // Blend using premultiplied alpha
    vec4 outputColor;
    outputColor.rgb = cloudColor.rgb * cloudColor.a + backgroundColor.rgb * (1.0 - cloudColor.a);
    outputColor.a = 1.0;

    gl_FragColor = outputColor;
    }

    #include <logdepthbuf_fragment>
}
  `,
    uniforms: {
      inputBuffer: new Uniform(null),
      cameraPos: new Uniform(new Vector3(0, 0, -2)),
      cameraMatrix: new Uniform(new Matrix4().identity()),
      fov: new Uniform(0),
      aspectRatio: new Uniform(0),
      near: new Uniform(0),
      far: new Uniform(0),
      uDepth: new Uniform(null),
      uTime: new Uniform(0),
      uColor: new Uniform(new Vector3(0, 0, -2)),
      noiseTexture: new Uniform(generateNoiseTexture(128)),
      scale: new Uniform(new Vector3(0.25, 0.001, 0.25)),
      useFog: new Uniform(true),
      two: new Uniform(true),
      torusPosition: new Uniform(new Vector3(0.0, 0.0, 0.0)),
      lightDirection: new Uniform(new Vector3(1.0, 0.5, 1.0))
    }
  })
}
export { SDFShader }
