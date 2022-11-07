import { Color } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum'

export const EnvmapComponent = defineComponent({
  name: 'EnvmapComponent',
  onInit: (entity) => {
    return {
      type: EnvMapSourceType.None as typeof EnvMapSourceType[keyof typeof EnvMapSourceType],
      envMapTextureType: EnvMapTextureType.Equirectangular as typeof EnvMapTextureType[keyof typeof EnvMapTextureType],
      envMapSourceColor: new Color(0xfff) as Color,
      envMapSourceURL: '',
      envMapIntensity: 1
    }
  },

  onSet: (entity, component, json) => {
    if (typeof json?.type === 'string') component.type.set(json.type)
    if (typeof json?.envMapTextureType === 'string') component.envMapTextureType.set(json.envMapTextureType)
    if (typeof json?.envMapSourceColor === 'number') component.envMapSourceColor.set(new Color(json.envMapSourceColor))
    if (typeof json?.envMapSourceURL === 'string') component.envMapSourceURL.set(json.envMapSourceURL)
    if (typeof json?.envMapIntensity === 'number') component.envMapIntensity.set(json.envMapIntensity)
  },

  toJSON: (entity, component) => {
    return {
      type: component.type.value,
      envMapTextureType: component.envMapTextureType.value,
      envMapSourceColor: component.envMapSourceColor.value,
      envMapSourceURL: component.envMapSourceURL.value,
      envMapIntensity: component.envMapIntensity.value
    }
  },

  errors: ['MISSING_FILE']
})

export const SCENE_COMPONENT_ENVMAP = 'envmap'
