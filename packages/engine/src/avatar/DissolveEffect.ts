import {
  Color,
  Mesh,
  Object3D,
  ShaderLib,
  ShaderMaterial,
  TangentSpaceNormalMap,
  UniformsLib,
  UniformsUtils,
  Vector2
} from 'three'

import { CustomMaterial, extendMaterial } from './ExtendMaterial'

export class DissolveEffect {
  time = 0
  object
  maxHeight = 1
  minHeight = 0
  step = 0.001

  constructor(object: Object3D, minHeight: number, maxHeight: number) {
    object.traverse((child) => {
      if (child['material']) {
        child.visible = true
      }
    })
    this.object = object
    this.minHeight = minHeight - 1
    this.maxHeight = maxHeight + 1
    this.step = (this.maxHeight - this.minHeight) / 150
    this.time = this.minHeight
  }

  dispose() {}

  update(dt) {
    if (this.time <= this.maxHeight) {
      this.object.traverse((child) => {
        if (child['material'] && child.name !== 'light_obj' && child.name !== 'plate_obj') {
          if (child.material.uniforms && child.material.uniforms.time) {
            child.material.uniforms.time.value = this.time
          }
        }
      })

      this.time += this.step
      return false
    }
    this.dispose()
    return true
  }

  static getDissolveTexture(object: Mesh): any {
    const hasUV = object.geometry.hasAttribute('uv')
    const material = object.material as any
    const hasTexture = !!material.map

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

    let uniforms = {
      color: {
        value: (material as any).color
      },
      diffuse: {
        value: (material as any).color
      },
      origin_texture: {
        value: (material as any).map
      },
      time: {
        value: -200
      }
    }

    console.error(shaderNameMapping[material.type])

    const shader = ShaderLib[shaderNameMapping[material.type] ?? 'standard']
    let fragmentShader = shader.fragmentShader
    let vertexShader = shader.vertexShader

    Object.keys(shader.uniforms).forEach((key) => {
      if (material[key]) {
        uniforms[key] = { value: material[key] }
      }
    })

    uniforms = UniformsUtils.merge([UniformsLib['lights'], uniforms])

    const vertexNonUVShader = `
      vec2 clipSpace = gl_Position.xy / gl_Position.w;
      vUv3 = clipSpace * 0.5 + 0.5;
      vPosition = position.y;
      `

    const vertexUVShader = `
      vUv3 = uv;
      vPosition = position.y;
      `

    const fragmentColorShader = `
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

    const fragmentTextureShader = `
      float offset = vPosition - time;
      if(offset > (-0.01 - rand(time) * 0.3)){
      gl_FragColor = texture2D(origin_texture, vUv3);
      gl_FragColor.r = 0.0;
      gl_FragColor.g = 1.0;
      gl_FragColor.b = 0.0;
      }
      if(offset > 0.0){
      discard;
      }
      `
    const vertexHeaderShader = `
      varying vec2 vUv3;
      varying float vPosition;
    `

    const fragmentHeaderShader = `
      uniform vec3 color;
      varying vec2 vUv3;
      varying float vPosition;
      uniform float time;
      uniform sampler2D texture_dissolve;
      uniform sampler2D origin_texture;
      float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }
    `

    const appendText = (text, pattern, word) => {
      const textArray = text.split(pattern)
      if (textArray.length != 0) {
        const idx = textArray[0].length + pattern.length
        return text.slice(0, idx) + word + text.slice(idx)
      } else {
        return text
      }
    }

    vertexShader = appendText(vertexShader, '#include <clipping_planes_pars_vertex>', vertexHeaderShader)
    vertexShader = appendText(vertexShader, '#include <fog_vertex>', hasUV ? vertexUVShader : vertexNonUVShader)

    fragmentShader = appendText(fragmentShader, '#include <clipping_planes_pars_fragment>', fragmentHeaderShader)
    fragmentShader = appendText(
      fragmentShader,
      '#include <output_fragment>',
      hasTexture ? fragmentTextureShader : fragmentColorShader
    )

    const myMaterial = new ShaderMaterial({
      uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      lights: true
    })

    console.error(uniforms)

    return myMaterial

    // return material
  }
}
