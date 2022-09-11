import {
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  ShaderLib,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils
} from 'three'

import { Engine } from '../ecs/classes/Engine'

export class DissolveEffect {
  time: number
  object: Object3D
  maxHeight: number
  minHeight: number
  step: number

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
      this.object.traverse((child: Mesh<any, any>) => {
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

  static getDissolveTexture(object: Mesh<any, MeshBasicMaterial & ShaderMaterial>): any {
    const hasUV = object.geometry.hasAttribute('uv')
    const isShaderMaterial = object.material.type == 'ShaderMaterial'
    const isPhysicalMaterial = object.material.type == 'MeshStandardMaterial'
    const material = object.material.clone()
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
      time: {
        value: -200
      }
    }

    let fragmentShader = ''
    let vertexShader = ''

    if (isShaderMaterial) {
      uniforms = UniformsUtils.merge([material.uniforms, uniforms])
      fragmentShader = material.fragmentShader
      vertexShader = material.vertexShader
    } else {
      // built-in material
      const shader = ShaderLib[shaderNameMapping[material.type] ?? 'standard']
      fragmentShader = shader.fragmentShader
      vertexShader = shader.vertexShader
      Object.keys(shader.uniforms).forEach((key) => {
        if (material[key]) {
          uniforms[key] = { value: material[key] }
        }
      })
    }

    uniforms = UniformsUtils.merge([UniformsLib['lights'], uniforms])

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

    if (isShaderMaterial) {
      material.vertexShader = vertexShader
      material.fragmentShader = fragmentShader
      material.uniforms = uniforms
      material.needsUpdate = true
      return material
    } else {
      const myMaterial = new ShaderMaterial({
        uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        lights: true,
        // @ts-ignore
        fog: false,
        transparent: material.transparent
      })

      if (myMaterial.uniforms.map) {
        myMaterial.uniforms.map.value = (material as any).map
      }

      myMaterial.uniforms.origin_texture = {
        value: (material as any).map
      }
      if (isPhysicalMaterial) {
        //@ts-ignore
        myMaterial.envMap = Engine.instance.currentWorld.scene?.environment
        //@ts-ignore
        myMaterial.envMapIntensity = { value: 1 }
        myMaterial.uniforms.envMap = {
          value: Engine.instance.currentWorld.scene?.environment
        }
        myMaterial.uniforms.envMapIntensity = { value: 1 }
      }

      myMaterial.needsUpdate = true
      myMaterial.visible = material.visible
      return myMaterial
    }
  }
}
