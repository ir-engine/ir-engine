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

import { Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial } from 'three'
import matches from 'ts-matches'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarDissolveComponent = defineComponent({
  name: 'AvatarDissolveComponent',

  onInit: (entity) => {
    return {
      minHeight: 0,
      maxHeight: 0,
      currentTime: 0,
      dissolveMaterials: [] as Material[]
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (matches.number.test(json.minHeight)) component.minHeight.set(json.minHeight)
    if (matches.number.test(json.maxHeight)) component.maxHeight.set(json.maxHeight)
    if (matches.number.test(json.currentTime)) component.maxHeight.set(json.currentTime)
  },

  createDissolveMaterial(object: Mesh<any, MeshBasicMaterial & ShaderMaterial>, entity: Entity): any {
    const hasUV = object.geometry.hasAttribute('uv')
    const material = object.material.clone()
    const hasTexture = !!material.map

    let fragmentShader = ''
    let vertexShader = ''

    const vertexNonUVShader = `
    #include <fog_vertex>
    vec2 clipSpace = gl_Position.xy / gl_Position.w;
    vUv3 = clipSpace * 0.5 + 0.5;
    vPosition = position.y;
  `

    const vertexUVShader = `
    #include <fog_vertex>
    vUv3 = uv;
    vPosition = position.y;
  `

    const fragmentColorShader = `
    #include <output_fragment>
    float offset = vPosition - time;
    if(offset > (-0.01 - rand(time) * 0.3)){
    gl_FragColor = vec4(color.r, color.g, color.b, 1.0);
    gl_FragColor.r = 0.0;
    gl_FragColor.g = 1.0;
    gl_FragColor.b = 0.0;
    }
    if(offset > 0.0){
    discard;
    }
  `

    let textureShader = `gl_FragColor = textureColor;`
    if (hasTexture && (material as any).map.isVideoTexture) {
      textureShader = `gl_FragColor = sRGBToLinear(textureColor);`
    }

    const fragmentTextureShader = `
    #include <output_fragment>
    float offset = vPosition - time;
    vec4 textureColor = texture2D(origin_texture, vUv3);
    ${textureShader}
    if(offset > (-0.01 - rand(time) * 0.3)){
    gl_FragColor.r = 0.0;
    gl_FragColor.g = 1.0;
    gl_FragColor.b = 0.0;
    }
    if(offset > 0.0){
    discard;
    }
  `

    const vertexHeaderShader = `
    #include <clipping_planes_pars_vertex>
    varying vec2 vUv3;
    varying float vPosition;
  `

    const fragmentHeaderShader = `
    #include <clipping_planes_pars_fragment>
    uniform vec3 color;
    varying vec2 vUv3;
    varying float vPosition;
    uniform float time;
    uniform sampler2D texture_dissolve;
    uniform sampler2D origin_texture;
    float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }
    vec4 sRGBToLinear( in vec4 value ) {
      return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
    }
  `

    vertexShader = vertexShader.replace('#include <clipping_planes_pars_vertex>', vertexHeaderShader)
    vertexShader = vertexShader.replace('#include <fog_vertex>', hasUV ? vertexUVShader : vertexNonUVShader)
    fragmentShader = fragmentShader.replace('#include <clipping_planes_pars_fragment>', fragmentHeaderShader)
    fragmentShader = fragmentShader.replace(
      '#include <output_fragment>',
      hasTexture ? fragmentTextureShader : fragmentColorShader
    )

    material.vertexShader = vertexShader
    material.fragmentShader = fragmentShader

    const myMaterial = Object.assign(new MeshStandardMaterial(), material)
    myMaterial.onBeforeCompile = function (shader) {
      shader.fragmentShader = fragmentShader
      shader.vertexShader = vertexShader
      myMaterial.uniforms.time = { value: 1 }
    }
    myMaterial.visible = material.visible

    console.log(entity)
    getComponent(entity, AvatarDissolveComponent).dissolveMaterials.push(myMaterial)

    return myMaterial
  },

  updateDissolveEffect(entity: Entity, dt: number) {
    const dissolveComponent = getComponent(entity, AvatarDissolveComponent)
    dissolveComponent.currentTime += dt
    for (let i = 0; i < dissolveComponent.dissolveMaterials.length; i++) {
      ;(dissolveComponent.dissolveMaterials[i] as any).uniforms.time.value = dissolveComponent.currentTime
    }
    return dissolveComponent.currentTime >= dissolveComponent.maxHeight
  }
})
