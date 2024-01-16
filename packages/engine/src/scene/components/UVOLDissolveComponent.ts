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

import {
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  ShaderLib,
  ShaderMaterial,
  Texture,
  UniformsLib,
  UniformsUtils
} from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent } from '../../ecs/functions/ComponentFunctions'

export const UVOLDissolveComponent = defineComponent({
  name: 'UVOLDissolveComponent',
  onInit: (entity) => ({
    currentTime: 0,
    duration: 2
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.duration === 'number') component.duration.set(json.duration)
  },

  /**
   * If material is a shader material,
   * This expects the texture to be at material.uniforms.map.value.
   * Otherwise, the texture is not used.
   *
   * If the templates are strings, they are appended to the default templates.
   * otherwise, they are used as regular expressions to replace the default templates.
   */
  createDissolveMaterial(
    mesh: Mesh<BufferGeometry, MeshBasicMaterial | ShaderMaterial>,
    vertexHeaderTemplate: string | RegExp = '#include <clipping_planes_pars_vertex>',
    vertexTemplate: string | RegExp = '#include <fog_vertex>',
    fragmentHeaderTemplate: string | RegExp = '#include <clipping_planes_pars_fragment>',
    fragmentTemplate: string | RegExp = '#include <opaque_fragment>'
  ) {
    const material = mesh.material
    const isShaderMaterial = 'isShaderMaterial' in material
    const texture: Texture = isShaderMaterial ? material.uniforms.map.value : material.map
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox()
    }
    const minY = mesh.geometry.boundingBox!.min.y
    const maxY = mesh.geometry.boundingBox!.max.y
    const height = maxY - minY

    let uniforms = {
      progress: {
        value: 0
      },
      loadedHeight: {
        value: 0
      },
      jitterWidth: {
        value: 0.1 * height
      },
      repeat: {
        value: texture.repeat
      },
      offset: {
        value: texture.offset
      },
      origin_texture: {
        value: texture
      }
    }

    let vertexShader = '',
      fragmentShader = ''
    if (isShaderMaterial) {
      vertexShader = material.vertexShader
      fragmentShader = material.fragmentShader
      uniforms = UniformsUtils.merge([material.uniforms, uniforms])
    } else {
      const shader = ShaderLib['basic']
      vertexShader = shader.vertexShader
      fragmentShader = shader.fragmentShader
      Object.keys(shader.uniforms).forEach((key) => {
        if (material[key]) {
          uniforms[key] = shader.uniforms[key]
        }
      })
    }

    uniforms = UniformsUtils.merge([UniformsLib['lights'], uniforms])

    let vertexShaderHeader = `
varying vec2 vUv;
varying float positionY;`
    if (typeof vertexHeaderTemplate === 'string') {
      vertexShaderHeader = vertexHeaderTemplate + vertexShaderHeader
    }

    let vertexShaderMain = `
vUv = uv;
positionY = position.y;`
    if (typeof vertexTemplate === 'string') {
      vertexShaderMain = vertexTemplate + vertexShaderMain
    }

    let fragmentShaderHeader = `
varying vec2 vUv;
varying float positionY;
uniform float loadedHeight;
uniform vec2 repeat;
uniform vec2 offset;
uniform sampler2D origin_texture;
uniform float jitterWidth;
uniform float progress;

vec4 sRGBToLinear( in vec4 value ) {
  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}`
    if (typeof fragmentHeaderTemplate === 'string') {
      fragmentShaderHeader = fragmentHeaderTemplate + fragmentShaderHeader
    }

    const textureShader =
      'isVideoTexture' in texture ? 'gl_FragColor = sRGBToLinear(textureColor);' : 'gl_FragColor = textureColor;'

    let fragmentShaderMain = `
float offset2 = positionY - loadedHeight;

vec2 transformedUV = vUv*repeat + offset;
vec4 textureColor = texture2D(origin_texture, transformedUV);

float jitterDelta = (rand(gl_FragCoord.xy) - 0.5) * 200.0; // [-100, 100]
float localJitter = jitterWidth * (100.0 + jitterDelta) / 100.0;

float lowerOffset = loadedHeight - localJitter;
float upperOffset = loadedHeight + localJitter;

float randomR = (sin(progress) * 0.5) + 0.5;
float randomG = .5;
float randomB = (cos(progress) * 0.5) + 0.5;

if (positionY < lowerOffset) {
  ${textureShader}
} else if (positionY > upperOffset) {
  discard;
} else {
  gl_FragColor.r = randomR;
  gl_FragColor.g = randomG;
  gl_FragColor.b = randomB;
}`
    if (typeof fragmentTemplate === 'string') {
      fragmentShaderMain = fragmentTemplate + fragmentShaderMain
    }

    vertexShader = vertexShader.replace(vertexHeaderTemplate, vertexShaderHeader)
    vertexShader = vertexShader.replace(vertexTemplate, vertexShaderMain)

    fragmentShader = fragmentShader.replace(fragmentHeaderTemplate, fragmentShaderHeader)
    fragmentShader = fragmentShader.replace(fragmentTemplate, fragmentShaderMain)

    const newMaterial = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      lights: true,
      fog: false,
      transparent: material.transparent
    })
    newMaterial.needsUpdate = true
    newMaterial.visible = material.visible

    return newMaterial
  },

  /**
   * Interpolates the duration to bounding box's minY and maxY.
   * Returns true when the loading effect is finished.
   */
  updateDissolveEffect(entity: Entity, mesh: Mesh<BufferGeometry, ShaderMaterial>, deltaTime: number) {
    const dissolveComponent = getComponent(entity, UVOLDissolveComponent)
    if (!dissolveComponent) return true

    if (!mesh.material.uniforms.progress) return true

    dissolveComponent.currentTime += deltaTime
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox()
    }
    const minY = mesh.geometry.boundingBox!.min.y
    const maxY = mesh.geometry.boundingBox!.max.y
    const duration = dissolveComponent.duration

    const loadedHeight = Math.min(
      maxY,
      Math.max(minY, minY + (maxY - minY) * (dissolveComponent.currentTime / duration))
    )

    mesh.material.uniforms.loadedHeight.value = loadedHeight
    mesh.material.uniforms.progress.value = dissolveComponent.currentTime / duration

    return dissolveComponent.currentTime >= duration
  }
})
