import { ShaderMaterial, Object3D, Mesh } from 'three'

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
          if (child.material.uniforms) child.material.uniforms.time.value = this.time
        }
      })

      this.time += this.step
      return false
    }
    this.dispose()
    return true
  }

  static getDissolveTexture(object: Mesh): ShaderMaterial {
    const vertexNonUVShader = [
      'varying float posY;',
      'varying vec2 vUv;',
      '#include <skinning_pars_vertex>',
      'void main() {',
      '#include <skinbase_vertex>',
      '#include <begin_vertex>',
      '#include <skinning_vertex>',
      '#include <project_vertex>',
      'vec2 clipSpace = gl_Position.xy / gl_Position.w;',
      'vUv = clipSpace * 0.5 + 0.5;',
      'posY = position.y;',
      '}'
    ].join('\n')

    const vertexUVShader = [
      'varying vec2 vUv;',
      'varying float posY;',
      '#include <skinning_pars_vertex>',
      'void main() {',
      '#include <skinbase_vertex>',
      '#include <begin_vertex>',
      '#include <skinning_vertex>',
      '#include <project_vertex>',
      'vUv = uv;',
      'posY = position.y;',
      '}'
    ].join('\n')

    const fragmentColorShader = [
      'uniform vec3 color;',
      'varying vec2 vUv;',
      'varying float posY;',
      'uniform float time;',
      'uniform sampler2D texture_dissolve;',
      'float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }',
      'void main() {',
      // ' vec4 dissolveData = texture2D( texture_dissolve, vUv );',
      // ' float greyValue = dissolveData.g;',
      // ' float difference = greyValue - time;',
      '	gl_FragColor = vec4(color.r, color.g, color.b, 1.0);',
      '	float offset = posY - time;',
      ' if(offset > (-0.01 - rand(time) * 0.3)){',
      '   gl_FragColor.r = 0.0;',
      '   gl_FragColor.g = 1.0;',
      '   gl_FragColor.b = 0.0;',
      ' }',
      ' if(offset > 0.0){',
      '   discard;',
      ' }',
      '}'
    ].join('\n')

    const fragmentTextureShader = [
      'uniform vec3 color;',
      'varying vec2 vUv;',
      'varying float posY;',
      'uniform float time;',
      'uniform sampler2D texture_dissolve;',
      'uniform sampler2D origin_texture;',
      'float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }',
      'void main() {',
      // ' vec4 dissolveData = texture2D( texture_dissolve, vUv );',
      // ' float greyValue = dissolveData.g;',
      // ' float difference = greyValue - time;',
      '	gl_FragColor = texture2D(origin_texture, vUv);',
      '	float offset = posY - time;',
      ' if(offset > (-0.01 - rand(time) * 0.3)){',
      '   gl_FragColor.r = 0.0;',
      '   gl_FragColor.g = 1.0;',
      '   gl_FragColor.b = 0.0;',
      ' }',
      ' if(offset > 0.0){',
      '   discard;',
      ' }',
      '}'
    ].join('\n')

    const hasUV = object.geometry.hasAttribute('uv')
    const hasTexture = (<any>object.material).map !== null

    const mat = new ShaderMaterial({
      uniforms: {
        color: {
          value: (<any>object.material).color
        },
        origin_texture: {
          value: (<any>object.material).map
        },
        // texture_dissolve: {
        //   value: textureNoise
        // },
        time: {
          value: -200
        }
      },
      vertexShader: hasUV ? vertexUVShader : vertexNonUVShader,
      fragmentShader: hasTexture ? fragmentTextureShader : fragmentColorShader
    })

    return mat
  }
}
