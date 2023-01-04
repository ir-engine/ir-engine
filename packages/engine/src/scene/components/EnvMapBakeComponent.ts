import { Vector3 } from 'three'

import { createMappedComponent, defineComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapBakeRefreshTypes } from '../types/EnvMapBakeRefreshTypes'
import { EnvMapBakeTypes } from '../types/EnvMapBakeTypes'

export const EnvMapBakeComponent = defineComponent({
  name: 'EnvMapBakeComponent',

  onInit: (entity) => {
    return {
      bakePosition: new Vector3(),
      bakePositionOffset: new Vector3(),
      bakeScale: new Vector3().set(1, 1, 1),
      bakeType: EnvMapBakeTypes.Baked,
      resolution: 1024,
      refreshMode: EnvMapBakeRefreshTypes.OnAwake,
      envMapOrigin: '',
      boxProjection: true,
      helper: null
    }
  },

  onSet: (entity, component, json) => {},

  toJSON: (entity, component) => {
    return {
      bakePosition: component.bakePosition.value,
      bakePositionOffset: component.bakePositionOffset.value,
      bakeScale: component.bakeScale.value,
      bakeType: component.bakeType.value,
      resolution: component.resolution.value,
      refreshMode: component.refreshMode.value,
      envMapOrigin: component.envMapOrigin.value,
      boxProjection: component.boxProjection.value
    }
  }
})

export const SCENE_COMPONENT_ENVMAP_BAKE = 'envmapbake'
