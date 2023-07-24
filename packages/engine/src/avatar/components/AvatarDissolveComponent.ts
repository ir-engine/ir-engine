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

import { useEffect } from 'react'
import { Mesh, MeshBasicMaterial, ShaderLib, ShaderMaterial, UniformsLib, UniformsUtils } from 'three'
import matches from 'ts-matches'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { AvatarComponent } from './AvatarComponent'
import { AvatarEffectComponent } from './AvatarEffectComponent'

export const AvatarDissolveComponent = defineComponent({
  name: 'AvatarDissolveComponent',

  onInit: (entity) => {
    return {
      minHeight: -1,
      maxHeight: 1,
      currentTime: 0,
      dissolveMaterials: [] as ShaderMaterial[]
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (matches.number.test(json.minHeight)) component.minHeight.set(json.minHeight)
    if (matches.number.test(json.maxHeight)) component.maxHeight.set(json.maxHeight)
    if (matches.number.test(json.currentTime)) component.maxHeight.set(json.currentTime)
  },

  reactor: () => {
    const entity = useEntityContext()
    const dissolveComponent = getComponent(entity, AvatarDissolveComponent)
    const effectComponent = getComponent(entity, AvatarEffectComponent)
    const avatarComponent = getComponent(effectComponent.sourceEntity, AvatarComponent)

    useEffect(() => {
      console.log(avatarComponent)
      avatarComponent.model?.traverse((child: Mesh<any, any>) => {
        AvatarDissolveComponent.createDissolveMaterial(child as any)
        dissolveComponent.dissolveMaterials.push(child.material)
      })
    })

    return null
  },

  createDissolveMaterial(object: Mesh<any, MeshBasicMaterial & ShaderMaterial>): any {
    if (!object.material) return
    console.log(object.material)
    const hasUV = object.geometry.hasAttribute('uv')
    const isShaderMaterial = object.material.type == 'ShaderMaterial'
    const material = object.material
    const hasTexture = !!material.map

    material.visible = true

    const shaderNameMapping = {
      MeshLambertMaterial: 'lambert',
      MeshBasicMaterial: 'basic',
      MeshStandardMaterial: 'standard',
      MeshPhongMaterial: 'phong',
      MeshMatcapMaterial: 'matcap',
      MeshToonMaterial: 'toon',
      PointsMaterial: 'points',
      LineDashedMaterial: 'dashed',
      MeshDepthMaterial: 'depth',
      MeshNormalMaterial: 'normal',
      MeshDistanceMaterial: 'distanceRGBA',
      SpriteMaterial: 'sprite'
    }

    let fragmentShader = ''
    let vertexShader = ''

    if (isShaderMaterial) {
      fragmentShader = material.fragmentShader
      vertexShader = material.vertexShader
    } else {
      // built-in material
      const shader = ShaderLib[shaderNameMapping[material.type] ?? 'standard']
      fragmentShader = shader.fragmentShader
      vertexShader = shader.vertexShader
    }

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

    let uniforms = {}

    for (const [key, value] of Object.entries(material)) {
      uniforms[key] = { value: value }
    }

    uniforms['time'] = { value: 0 }

    uniforms = UniformsUtils.merge([UniformsLib['lights'], uniforms])

    const myMaterial = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, lights: true, fog: false })

    object.material = myMaterial as any
  },

  updateDissolveEffect(entity: Entity, dt: number) {
    const dissolveComponent = getComponent(entity, AvatarDissolveComponent)
    const effect = getComponent(entity, AvatarEffectComponent)
    if (!dissolveComponent) return false
    dissolveComponent.currentTime += dt
    for (let i = 0; i < dissolveComponent.dissolveMaterials.length; i++) {
      const material = dissolveComponent.dissolveMaterials[i]
      if (material == undefined) continue
      material.uniforms.time.value = dissolveComponent.currentTime
    }

    return dissolveComponent.currentTime >= dissolveComponent.maxHeight
  }
})
