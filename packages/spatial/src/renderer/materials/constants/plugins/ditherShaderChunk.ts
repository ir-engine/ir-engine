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

/*
NOTE: commenting out the #ifndef LAMBERT and #endif in the ditheringVertexUniform and ditheringVertex and ditheringFragUniform due to
issue where avatar would vanish when forcing to LAMBERT material in qualitySettings 0 (sceneObjectSYstem.tsx and PerformanceState - forceBasicMaterials)
- leaving as comments rather than removing for future context, as this used to work before but something changed
*/
/** glsl, vertex uniforms */
export const ditheringVertexUniform = `
//#ifndef LAMBERT
    varying vec3 vWorldPosition;
//#endif
varying vec3 vLocalPosition;
`

/** glsl, vertex main */
export const ditheringVertex = `
//#ifndef LAMBERT
    vWorldPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;
//#endif
vLocalPosition = position.xyz;
`

/** glsl, fragment uniforms */
export const ditheringFragUniform = `
//#ifndef LAMBERT
    varying vec3 vWorldPosition;
//#endif
varying vec3 vLocalPosition; 

uniform vec3 centers[2];
uniform float exponents[2];
uniform float distances[2];
uniform int useWorldCalculation[2];
`

/** glsl, fragment main */
export const ditheringAlphatestChunk = `
// sample sine at screen space coordinates for dithering pattern
float distance = 1.0;
float alphaTest = 0.5;
for(int i = 0; i < 2; i++){
    distance *= pow(clamp(distances[i]*length(centers[i] - (useWorldCalculation[i] == 1 ? vWorldPosition : vLocalPosition)), 0.0, 1.0), exponents[i]);
}

float dither = (sin( gl_FragCoord.x * 2.0)*sin( gl_FragCoord.y * 2.0));

dither += 1.0;
dither *= 0.5;
dither -= distance;

if(1.0-dither <= 1.0) discard;

diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );

if ( diffuseColor.a == 0.0 ) discard;

if ( diffuseColor.a < alphaTest ) discard;
    `
