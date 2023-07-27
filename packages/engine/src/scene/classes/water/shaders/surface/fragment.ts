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
uniform sampler2D envMap;
uniform samplerCube skybox;

varying vec2 refractedPosition[3];
varying vec3 reflected;
varying float reflectionFactor;

varying vec2 vUv;

void main() {

  float circle = step(length(vUv - 0.5), 0.5);
  if(circle == 0.){
    discard;
  }

  // Color coming from the sky reflection
  vec3 reflectedColor = textureCube(skybox, reflected).xyz;

  // Color coming from the environment refraction, applying chromatic aberration
  vec3 refractedColor = vec3(1.);
  refractedColor.r = texture2D(envMap, refractedPosition[0] * 0.5 + 0.5).r;
  refractedColor.g = texture2D(envMap, refractedPosition[1] * 0.5 + 0.5).g;
  refractedColor.b = texture2D(envMap, refractedPosition[2] * 0.5 + 0.5).b;

  gl_FragColor = vec4(mix(refractedColor, reflectedColor, clamp(reflectionFactor, 0., 1.)), 1.);
}
`
