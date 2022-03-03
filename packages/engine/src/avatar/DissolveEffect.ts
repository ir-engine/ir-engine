import { Mesh, MeshStandardMaterial, Object3D, ShaderLib, ShaderMaterial, UniformsLib } from 'three'

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
          if (child.material.userData && child.material.userData.time) {
            child.material.userData.time.value = this.time
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
    const appendText = (text, pattern, word) => {
      const textArray = text.split(pattern)
      if (textArray.length != 0) {
        const idx = textArray[0].length + pattern.length
        console.log(text.slice(0, idx))
        console.log(text.slice(idx))
        console.log(text.slice(0, idx) + word + text.slice(idx))
        return text.slice(0, idx) + word + text.slice(idx)
      } else {
        return text
      }
    }

    const hasUV = object.geometry.hasAttribute('uv')
    const material = object.material as any
    const hasTexture = !!material.map

    if (hasUV && !hasTexture) {
      debugger
    }

    const vertexNonUVShader = `
      vec2 clipSpace = gl_Position.xy / gl_Position.w;
      vUv3 = clipSpace * 0.5 + 0.5;
      vPosition = position.y;
      `

    const vertexUVShader = `
      vUv3 = uv
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

    material.userData.time = {
      value: -200
    }

    try {
      material.onBeforeCompile = (shader) => {
        shader.uniforms.color = {
          value: material.color
        }

        shader.uniforms.origin_texture = {
          value: material.map
        }

        shader.uniforms.time = material.userData.time

        let vertexShader = appendText(
          shader.vertexShader,
          '#include <clipping_planes_pars_vertex>',
          `
          varying vec2 vUv3;
          varying float vPosition;
           `
        )
        vertexShader = appendText(vertexShader, '#include <project_vertex>', hasUV ? vertexUVShader : vertexNonUVShader)
        shader.vertexShader = vertexShader

        let fragmentShader = appendText(
          shader.fragmentShader,
          '#include <clipping_planes_pars_fragment>',
          `
          uniform vec3 color;
          varying vec2 vUv3;
          varying float vPosition;
          uniform float time;
          uniform sampler2D texture_dissolve;
          uniform sampler2D origin_texture;
          float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }
          `
        )
        fragmentShader = appendText(
          fragmentShader,
          '#include <output_fragment>',
          hasTexture ? fragmentTextureShader : fragmentColorShader
        )
        shader.fragmentShader = fragmentShader
      }
    } catch (error) {
      debugger
    }

    return material
  }
}
