import { useEffect } from 'react'
import {
  BackSide,
  BoxGeometry,
  Color,
  DoubleSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  ShaderLib,
  ShaderMaterial,
  sRGBEncoding,
  Texture,
  Vector3
} from 'three'

import { getState, useHookstate } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import {
  defineComponent,
  getOptionalComponent,
  getOptionalComponentState,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XRState } from '../../xr/XRState'
import { Sky } from '../classes/Sky'
import { SkyTypeEnum } from '../constants/SkyTypeEnum'
import { getPmremGenerator, loadCubeMapTexture, textureLoader } from '../constants/Util'
import { cloneUniforms } from '../functions/cloneUniforms'
import { addError, removeError } from '../functions/ErrorFunctions'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

export const vertex = /* glsl */ `
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

	// gl_Position.z = gl_Position.w; // set z to camera.far

}
`

export const fragment = /* glsl */ `

#ifdef ENVMAP_TYPE_CUBE

	uniform samplerCube envMap;

#elif defined( ENVMAP_TYPE_CUBE_UV )

	uniform sampler2D envMap;

#endif

uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;

varying vec3 vWorldDirection;

#include <cube_uv_reflection_fragment>

void main() {

	#ifdef ENVMAP_TYPE_CUBE

		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );

	#elif defined( ENVMAP_TYPE_CUBE_UV )

		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );

	#else

		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );

	#endif

	texColor.rgb *= backgroundIntensity;

	gl_FragColor = texColor;

	#include <tonemapping_fragment>
	#include <encodings_fragment>

}
`

export const SkyboxComponent = defineComponent({
  name: 'SkyboxComponent',
  onInit: (entity) => {
    const skyboxMesh = new Mesh(new BoxGeometry(10000, 10000, 10000), [new MeshBasicMaterial()])
    // skyboxMesh.geometry.deleteAttribute('normal')
    // skyboxMesh.geometry.deleteAttribute('uv')
    addObjectToGroup(entity, skyboxMesh)
    return {
      skyboxMesh,
      backgroundColor: new Color(0x000000),
      equirectangularPath: '',
      cubemapPath: '/hdr/cubemap/skyboxsun25deg/',
      backgroundType: 1,
      sky: null! as Sky | null,
      skyboxProps: {
        turbidity: 10,
        rayleigh: 1,
        luminance: 1,
        mieCoefficient: 0.004999999999999893,
        mieDirectionalG: 0.99,
        inclination: 0.10471975511965978,
        azimuth: 0.16666666666666666
      }
    }
  },
  onSet: (entity, component, json) => {
    if (typeof json?.backgroundColor === 'number') component.backgroundColor.set(new Color(json.backgroundColor))
    if (typeof json?.equirectangularPath === 'string') component.equirectangularPath.set(json.equirectangularPath)
    if (typeof json?.cubemapPath === 'string') component.cubemapPath.set(json.cubemapPath)
    if (typeof json?.backgroundType === 'number') component.backgroundType.set(json.backgroundType)
    if (typeof json?.skyboxProps === 'object') component.skyboxProps.set(json.skyboxProps)
  },
  toJSON: (entity, component) => {
    return {
      backgroundColor: component.backgroundColor.value.getHexString() as any as Color,
      equirectangularPath: component.equirectangularPath.value,
      cubemapPath: component.cubemapPath.value,
      backgroundType: component.backgroundType.value,
      skyboxProps: component.skyboxProps.get({ noproxy: true }) as any
    }
  },
  errors: ['FILE_ERROR'],

  onRemove: (entity, component) => {
    removeObjectFromGroup(entity, component.skyboxMesh.value)
  },

  reactor: function SkyboxReactor({ root }) {
    const entity = root.entity

    const componentState = useOptionalComponent(entity, SkyboxComponent)
    const xrState = useHookstate(getState(XRState))

    useEffect(() => {
      if (!componentState?.value || xrState.sessionMode.value === 'immersive-ar') return
      const component = componentState.value

      switch (component.backgroundType) {
        case SkyTypeEnum.color:
          // Engine.instance.currentWorld.scene.background = component.backgroundColor
          const material = new MeshBasicMaterial({ color: component.backgroundColor })
          component.skyboxMesh.material = material

          break

        case SkyTypeEnum.cubemap:
          loadCubeMapTexture(
            component.cubemapPath,
            (texture) => {
              texture.encoding = sRGBEncoding
              // Engine.instance.currentWorld.scene.background = texture

              // const material = new ShaderMaterial({
              //   name: 'BackgroundCubeMaterial',
              //   uniforms: cloneUniforms(ShaderLib.backgroundCube.uniforms),
              //   vertexShader: vertex,//ShaderLib.backgroundCube.vertexShader,
              //   fragmentShader: fragment,//ShaderLib.backgroundCube.fragmentShader,
              //   side: BackSide,
              //   depthTest: false,
              //   depthWrite: false,
              //   fog: false
              // })

              component.skyboxMesh.material = texture.images.map((image) => {
                return new MeshBasicMaterial({
                  map: new Texture(
                    image,
                    texture.mapping,
                    texture.wrapS,
                    texture.wrapT,
                    texture.magFilter,
                    texture.minFilter,
                    texture.format,
                    texture.type,
                    texture.anisotropy,
                    texture.encoding
                  ),
                  fog: false,
                  // depthTest: false,
                  // depthWrite: false,
                  side: DoubleSide
                })
              })
              console.log(component.skyboxMesh.material)
              // boxMesh.geometry.deleteAttribute( 'normal' );
              // boxMesh.geometry.deleteAttribute( 'uv' );
              // Object.defineProperty(material, 'envMap', {
              //   get: function () {
              //     return this.uniforms.envMap.value
              //   }
              // })

              const scene = Engine.instance.currentWorld.scene as any // no type defs

              // material.uniforms.envMap.value = texture;
              // material.uniforms.flipEnvMap.value = ( texture.isCubeTexture && texture.isRenderTargetTexture === false ) ? - 1 : 1;
              // material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness;
              // material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
              // material.toneMapped = ( texture.encoding === sRGBEncoding ) ? false : true;

              removeError(entity, SkyboxComponent, 'FILE_ERROR')
            },
            undefined,
            (error) => addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
          )
          break

        case SkyTypeEnum.equirectangular:
          textureLoader.load(
            component.equirectangularPath,
            (sourceTexture) => {
              sourceTexture.encoding = sRGBEncoding
              const texture = getPmremGenerator().fromEquirectangular(sourceTexture).texture
              // Engine.instance.currentWorld.scene.background = texture
              component.skyboxMesh.material.color.set('white')
              component.skyboxMesh.material.map = texture
              removeError(entity, SkyboxComponent, 'FILE_ERROR')
            },
            undefined,
            (error) => {
              addError(entity, SkyboxComponent, 'FILE_ERROR', error.message)
            }
          )
          break

        case SkyTypeEnum.skybox:
          const sky = new Sky()
          if (!component.sky) componentState.sky.set(sky)

          sky.azimuth = component.skyboxProps.azimuth
          sky.inclination = component.skyboxProps.inclination

          sky.mieCoefficient = component.skyboxProps.mieCoefficient
          sky.mieDirectionalG = component.skyboxProps.mieDirectionalG
          sky.rayleigh = component.skyboxProps.rayleigh
          sky.turbidity = component.skyboxProps.turbidity
          sky.luminance = component.skyboxProps.luminance

          setSkyDirection(sky.sunPosition)
          const texture = getPmremGenerator().fromCubemap(
            sky.generateSkyboxTextureCube(EngineRenderer.instance.renderer)
          ).texture
          component.skyboxMesh.material.color.set('white')
          component.skyboxMesh.material.map = texture

          break

        default:
          break
      }

      if (component.backgroundType !== SkyTypeEnum.skybox && component.sky) {
        componentState.sky.set(null)
      }
    }, [componentState, xrState.sessionMode])

    if (!hasComponent(entity, SkyboxComponent)) throw root.stop()

    return null
  }
})

const setSkyDirection = (direction: Vector3): void => {
  EngineRenderer.instance.csm?.lightDirection.copy(direction).multiplyScalar(-1)
}

export const SCENE_COMPONENT_SKYBOX = 'skybox'
