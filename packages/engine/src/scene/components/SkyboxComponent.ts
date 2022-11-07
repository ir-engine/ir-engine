import { Color } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../classes/Sky'

export const SkyboxComponent = defineComponent({
  name: 'SkyboxComponent',
  onInit: (entity) => {
    return {
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
  errors: ['FILE_ERROR']
})

export const SCENE_COMPONENT_SKYBOX = 'skybox'
