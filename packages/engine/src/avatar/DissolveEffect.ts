import { Mesh, Object3D, ShaderMaterial } from 'three'

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
    const hasTexture = (object.material as any).map !== null

    const vertexNonUVShader = `
      vec2 clipSpace = gl_Position.xy / gl_Position.w;
      vUv = clipSpace * 0.5 + 0.5;
      posY = position.y;
    `

    const vertexUVShader = `
      vUv = uv
      posY = position.y;
    `

    const fragmentColorShader = `
    gl_FragColor = vec4(color.r, color.g, color.b, 1.0);
      float offset = posY - time;
      if(offset > (-0.01 - rand(time) * 0.3)){
        gl_FragColor.r = 0.0;
        gl_FragColor.g = 1.0;
        gl_FragColor.b = 0.0;
      }
      if(offset > 0.0){
        discard;
      }
    `

    const fragmentTextureShader = `
      gl_FragColor = texture2D(origin_texture, vUv);
    `

    const myMaterial = extendMaterial(object.material, {
      class: CustomMaterial,
      header: '',
      headerVertex: '',
      headerFragment: '',
      vertex: {
        '#include <clipping_planes_pars_vertex>': `
          varying vec2 vUv;
          varying float posY;
        `,
        '#include <project_vertex>': hasUV ? vertexUVShader : vertexNonUVShader
      },
      fragment: {
        '#include <clipping_planes_pars_fragment>': `
          uniform vec3 color;
          varying vec2 vUv;
          varying float posY;
          uniform float time;
          uniform sampler2D texture_dissolve;
          uniform sampler2D origin_texture;
          float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }
        `,
        '#include <output_fragment>': hasTexture ? fragmentTextureShader : fragmentColorShader
      },
      // Uniforms (will be applied to existing or added) as value or uniform object
      uniforms: {
        color: {
          value: (object.material as any).color
        },
        origin_texture: {
          value: (object.material as any).map
        },
        time: {
          value: -200
        }
      }
    })
    console.log(myMaterial)
    debugger
    return myMaterial
    // const vertexNonUVShader = [
    //   'varying float posY;',
    //   'varying vec2 vUv;',
    //   '#include <skinning_pars_vertex>',
    //   'void main() {',
    //   '#include <skinbase_vertex>',
    //   '#include <begin_vertex>',
    //   '#include <skinning_vertex>',
    //   '#include <project_vertex>',
    //   'vec2 clipSpace = gl_Position.xy / gl_Position.w;',
    //   'vUv = clipSpace * 0.5 + 0.5;',
    //   'posY = position.y;',
    //   '}'
    // ].join('\n')

    // const vertexUVShader = [
    //   'varying vec2 vUv;',
    //   'varying float posY;',
    //   '#include <skinning_pars_vertex>',
    //   'void main() {',
    //   '#include <skinbase_vertex>',
    //   '#include <begin_vertex>',
    //   '#include <skinning_vertex>',
    //   '#include <project_vertex>',
    //   'vUv = uv;',
    //   'posY = position.y;',
    //   '}'
    // ].join('\n')

    // const fragmentColorShader = [
    //   'uniform vec3 color;',
    //   'varying vec2 vUv;',
    //   'varying float posY;',
    //   'uniform float time;',
    //   'uniform sampler2D texture_dissolve;',
    //   'float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }',
    //   'void main() {',
    //   // ' vec4 dissolveData = texture2D( texture_dissolve, vUv );',
    //   // ' float greyValue = dissolveData.g;',
    //   // ' float difference = greyValue - time;',
    //   '	gl_FragColor = vec4(color.r, color.g, color.b, 1.0);',
    //   '	float offset = posY - time;',
    //   ' if(offset > (-0.01 - rand(time) * 0.3)){',
    //   '   gl_FragColor.r = 0.0;',
    //   '   gl_FragColor.g = 1.0;',
    //   '   gl_FragColor.b = 0.0;',
    //   ' }',
    //   ' if(offset > 0.0){',
    //   '   discard;',
    //   ' }',
    //   '}'
    // ].join('\n')

    // const fragmentTextureShader = [
    //   'uniform vec3 color;',
    //   'varying vec2 vUv;',
    //   'varying float posY;',
    //   'uniform float time;',
    //   'uniform sampler2D texture_dissolve;',
    //   'uniform sampler2D origin_texture;',
    //   'float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }',
    //   'void main() {',
    //   // ' vec4 dissolveData = texture2D( texture_dissolve, vUv );',
    //   // ' float greyValue = dissolveData.g;',
    //   // ' float difference = greyValue - time;',
    //   '	gl_FragColor = texture2D(origin_texture, vUv);',
    //   '	float offset = posY - time;',
    //   ' if(offset > (-0.01 - rand(time) * 0.3)){',
    //   '   gl_FragColor.r = 0.0;',
    //   '   gl_FragColor.g = 1.0;',
    //   '   gl_FragColor.b = 0.0;',
    //   ' }',
    //   ' if(offset > 0.0){',
    //   '   discard;',
    //   ' }',
    //   '}'
    // ].join('\n')

    // debugger

    // const frag = `
    // #define STANDARD
    // #ifdef PHYSICAL
    //   #define IOR
    //   #define SPECULAR
    // #endif
    // uniform vec3 diffuse;
    // uniform vec3 emissive;
    // uniform float roughness;
    // uniform float metalness;
    // uniform float opacity;
    // #ifdef IOR
    //   uniform float ior;
    // #endif
    // #ifdef SPECULAR
    //   uniform float specularIntensity;
    //   uniform vec3 specularColor;
    //   #ifdef USE_SPECULARINTENSITYMAP
    //     uniform sampler2D specularIntensityMap;
    //   #endif
    //   #ifdef USE_SPECULARCOLORMAP
    //     uniform sampler2D specularColorMap;
    //   #endif
    // #endif
    // #ifdef USE_CLEARCOAT
    //   uniform float clearcoat;
    //   uniform float clearcoatRoughness;
    // #endif
    // #ifdef USE_SHEEN
    //   uniform vec3 sheenColor;
    //   uniform float sheenRoughness;
    //   #ifdef USE_SHEENCOLORMAP
    //     uniform sampler2D sheenColorMap;
    //   #endif
    //   #ifdef USE_SHEENROUGHNESSMAP
    //     uniform sampler2D sheenRoughnessMap;
    //   #endif
    // #endif
    // varying vec3 vViewPosition;
    // #include <common>
    // #include <packing>
    // #include <dithering_pars_fragment>
    // #include <color_pars_fragment>
    // #include <uv_pars_fragment>
    // #include <uv2_pars_fragment>
    // #include <map_pars_fragment>
    // #include <alphamap_pars_fragment>
    // #include <alphatest_pars_fragment>
    // #include <aomap_pars_fragment>
    // #include <lightmap_pars_fragment>
    // #include <emissivemap_pars_fragment>
    // #include <bsdfs>
    // #include <cube_uv_reflection_fragment>
    // #include <envmap_common_pars_fragment>
    // #include <envmap_physical_pars_fragment>
    // #include <fog_pars_fragment>
    // #include <lights_pars_begin>
    // #include <normal_pars_fragment>
    // #include <lights_physical_pars_fragment>
    // #include <transmission_pars_fragment>
    // #include <shadowmap_pars_fragment>
    // #include <bumpmap_pars_fragment>
    // #include <normalmap_pars_fragment>
    // #include <clearcoat_pars_fragment>
    // #include <roughnessmap_pars_fragment>
    // #include <metalnessmap_pars_fragment>
    // #include <logdepthbuf_pars_fragment>
    // #include <clipping_planes_pars_fragment>
    // uniform vec3 color;
    // varying vec2 vUv;
    // varying float posY;
    // uniform float time;
    // uniform sampler2D texture_dissolve;
    // uniform sampler2D origin_texture;
    // float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }
    // void main() {
    //   #include <clipping_planes_fragment>
    //   vec4 diffuseColor = vec4( diffuse, opacity );
    //   ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    //   vec3 totalEmissiveRadiance = emissive;
    //   #include <logdepthbuf_fragment>
    //   #include <map_fragment>
    //   #include <color_fragment>
    //   #include <alphamap_fragment>
    //   #include <alphatest_fragment>
    //   #include <roughnessmap_fragment>
    //   #include <metalnessmap_fragment>

    //   #include <normal_fragment_maps>
    //   #include <clearcoat_normal_fragment_begin>
    //   #include <clearcoat_normal_fragment_maps>
    //   #include <emissivemap_fragment>

    //   #include <aomap_fragment>
    //   vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
    //   vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
    //   #include <transmission_fragment>
    //   vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
    //   #ifdef USE_SHEEN
    //     float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
    //     outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
    //   #endif
    //   #ifdef USE_CLEARCOAT
    //     float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
    //     vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
    //     outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
    //   #endif
    //   #include <output_fragment>
    //   #include <tonemapping_fragment>
    //   #include <encodings_fragment>
    //   #include <fog_fragment>
    //   #include <premultiplied_alpha_fragment>
    //   #include <dithering_fragment>
    // }`

    // const verts = `varying vec2 vUv;
    // varying float posY;
    // #include <skinning_pars_vertex>
    // void main() {
    // #include <skinbase_vertex>
    // #include <begin_vertex>
    // #include <skinning_vertex>
    // #include <project_vertex>
    // vUv = uv;
    // posY = position.y;
    // }`

    // const mat = new ShaderMaterial({
    //   uniforms: {
    //     color: {
    //       value: (object.material as any).color
    //     },
    //     origin_texture: {
    //       value: (object.material as any).map
    //     },
    //     // texture_dissolve: {
    //     //   value: textureNoise
    //     // },
    //     time: {
    //       value: -200
    //     }
    //   },
    //   vertexShader: verts,
    //   fragmentShader: frag
    // })
    // mat.needsUpdate = true;
    // console.log(mat)
    // return mat
  }
}
