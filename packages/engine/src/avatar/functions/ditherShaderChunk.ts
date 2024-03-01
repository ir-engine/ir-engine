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

/** glsl */
export const ditheringVertexUniform = `varying vec3 vWorldPosition;`

/** glsl */
export const ditheringVertex = `
vWorldPosition = (modelMatrix * vec4( transformed, 1.0 )).xyz;
`

/** glsl */
export const ditheringFragUniform = `
varying vec3 vWorldPosition;
uniform float ditheringExponent;
uniform float ditheringDistance;
`

/** glsl */
export const ditheringAlphatestChunk = `
// sample sine at screen space coordinates for dithering pattern
float dither = sin( gl_FragCoord.x * 4.0)*sin( gl_FragCoord.y * 4.0);
float distance = length(cameraPosition - vWorldPosition)*1.5;
dither += pow(ditheringDistance/distance, ditheringExponent)-1.0;
diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
diffuseColor.a -= max(dither, 0.0);

if ( diffuseColor.a == 0.0 ) discard;


if ( diffuseColor.a < alphaTest ) discard;
    `
