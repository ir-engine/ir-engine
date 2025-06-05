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
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { defineMaterialPlugin } from '../defineMaterialPlugin'

export const HolographicPluginComponent = defineMaterialPlugin({
  name: 'HolographicPluginComponent',

  jsonID: 'IR_material_holographic',

  uniforms: S.Object({
    speed: S.Number({ default: 0.1 }),
    time: S.Number({ default: 0 }),
    useBlink: S.Bool({ default: false }),
    mix_intensity: S.Number({ default: 1.0 }),
    hologramColor: T.Color(),
    hologramBrightness: S.Number({ default: 0.5 }),
    scanlineSize: S.Number({ default: 15.0 }),
    hologramOpacity: S.Number({ default: 0.5 })
  }),

  onApply: (shader) => {
    shader.vertexShader =
      `
          varying vec4 vPos;  
          varying vec2 myuv;
          varying vec3 vPositionNormal; 
          varying vec3 v_Normal; 
          ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      ` 

          void main() {
            //vec3 transformed = vec3(position);
            vPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            myuv = uv;
            vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
            v_Normal = normalize( normalMatrix * normal ); 
          `
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `
              uniform float speed;
              varying vec3 vPositionNormal; 
              varying vec3 v_Normal; 
              uniform float time; 
              uniform float mix_intensity; 
              uniform bool useBlink;
              uniform vec3 hologramColor;
              uniform float hologramBrightness;
              uniform float scanlineSize;
              uniform float hologramOpacity;
              varying vec4 vPos;
              varying vec2 myuv;
              float flicker( float amt, float time ) {return clamp( fract( cos( time ) * 4358.5453123 ), amt, 1.0 );}
              float random(in float a, in float b) { return fract((cos(dot(vec2(a,b) ,vec2(12.9898,78.233))) * 43758.5453)); }
        
      

          void main() {     

           
         `
    )

    const colorFragment = `
        #include <color_fragment>  
        vec2 vCoords = vPos.xy;
        vCoords /= vPos.w;
        vCoords = vCoords * 0.5 + 0.5;
        vec2 myUV = fract( vCoords );

        // // Defines hologram main color
        vec4 hologramColor = vec4(hologramColor, mix(hologramBrightness, myuv.y, 0.5));

        // // Add scanlines
        float scanlines = 10.;
        scanlines += 20. * sin(time *speed * 20.8 - myUV.y * 60. * scanlineSize);
        scanlines *= smoothstep(1.3 * cos(time *speed + myUV.y * scanlineSize), 0.78, 0.9);
        scanlines *= max(0.25, sin(time *speed) * 1.0);        
        
        // // Scanlines offsets
        float r = random(myuv.x, myuv.y);
        float g = random(myuv.y * 20.2, 	myuv.y * .2);
        float b = random(myuv.y * .9, 	myuv.y * .2);

        // // Scanline composition
        hologramColor += vec4(r*scanlines, b*scanlines, r, 1.0) / 84.;
        vec4 scanlineMix = mix(vec4(0.0), hologramColor, hologramColor.a);

        // // Calculates fresnel
        float fresnel=pow( (1. + -1. * abs(dot(v_Normal, vPositionNormal)))*2.2, 2.0 );

        // // Blinkin effect
        float blinkValue = 1.0 - speed;
        float blink = flicker(blinkValue, time * speed * .002);
    

        vec4 initial_diffuse=diffuseColor;
        if(useBlink){
            diffuseColor = mix( initial_diffuse,vec4( scanlineMix.rgb+fresnel*blink, 1.0),mix_intensity);}
        else{
            diffuseColor = mix( initial_diffuse,vec4( scanlineMix.rgb+fresnel, 1.0),mix_intensity);
        }
        `
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', colorFragment)

    const alphamapFragment = `
        #include <alphamap_fragment>   
    

        diffuseColor.a = hologramOpacity;
      
        `
    shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>', alphamapFragment)
  },

  update: (component, deltaSeconds) => {
    component.time += deltaSeconds
  }
})
