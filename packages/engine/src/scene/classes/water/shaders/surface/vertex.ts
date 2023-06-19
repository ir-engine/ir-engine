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

export default `
uniform sampler2D height;
uniform vec3 localCameraPos;

varying vec2 refractedPosition[3];
varying vec3 reflected;
varying float reflectionFactor;
varying vec2 vUv;

const float refractionFactor = 1.;

const float fresnelBias = 0.1;
const float fresnelPower = 2.;
const float fresnelScale = 1.;

// Air refractive index / Water refractive index
const float eta = 0.7504;

void main() {
  vec4 info = texture2D(height, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  vec3 pos = vec3(position.xy, position.z + info.r);
  vec3 norm = normalize(vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a)).xzy;

  vec3 eye = normalize(pos - localCameraPos);
  vec3 refracted = normalize(refract(eye, norm, eta));
  reflected = normalize(reflect(eye, norm));

  reflectionFactor = fresnelBias + fresnelScale * pow(1. + dot(eye, norm), fresnelPower);

  mat4 proj = projectionMatrix * modelViewMatrix;

  vec4 projectedRefractedPosition = proj * vec4(pos + refractionFactor * refracted, 1.0);
  refractedPosition[0] = projectedRefractedPosition.xy / projectedRefractedPosition.w;

  projectedRefractedPosition = proj * vec4(pos + refractionFactor * normalize(refract(eye, norm, eta * 0.96)), 1.0);
  refractedPosition[1] = projectedRefractedPosition.xy / projectedRefractedPosition.w;

  projectedRefractedPosition = proj * vec4(pos + refractionFactor * normalize(refract(eye, norm, eta * 0.92)), 1.0);
  refractedPosition[2] = projectedRefractedPosition.xy / projectedRefractedPosition.w;

  vUv = uv;
  gl_Position = proj * vec4(pos, 1.0);
}
`
