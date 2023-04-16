import { Color, Vector2, Vector3 } from 'three'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { Clouds } from '../classes/Clouds'

export type CloudComponentType = {
  texture: string
  worldScale: Vector3
  dimensions: Vector3
  noiseZoom: Vector3
  noiseOffset: Vector3
  spriteScaleRange: Vector2
  fogColor: Color
  fogRange: Vector2
  clouds?: Clouds
}

export const CloudComponent = defineComponent({
  name: 'CloudComponent',
  onInit: () => {
    return {
      texture: SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.texture,
      worldScale: new Vector3().copy(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.worldScale),
      dimensions: new Vector3().copy(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.dimensions),
      noiseZoom: new Vector3().copy(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseZoom),
      noiseOffset: new Vector3().copy(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.noiseOffset),
      spriteScaleRange: new Vector2().copy(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.spriteScaleRange),
      fogColor: new Color(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.fogColor),
      fogRange: new Vector2().copy(SCENE_COMPONENT_CLOUD_DEFAULT_VALUES.fogRange)
    } as CloudComponentType
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.texture === 'string') component.texture.set(json.texture)
    if (typeof json.worldScale === 'object')
      component.worldScale.set(new Vector3(json.worldScale.x, json.worldScale.y, json.worldScale.z))
    if (typeof json.dimensions === 'object')
      component.dimensions.set(new Vector3(json.dimensions.x, json.dimensions.y, json.dimensions.z))
    if (typeof json.noiseZoom === 'object')
      component.noiseZoom.set(new Vector3(json.noiseZoom.x, json.noiseZoom.y, json.noiseZoom.z))
    if (typeof json.noiseOffset === 'object')
      component.noiseOffset.set(new Vector3(json.noiseOffset.x, json.noiseOffset.y, json.noiseOffset.z))
    if (typeof json.spriteScaleRange === 'object')
      component.spriteScaleRange.set(new Vector2(json.spriteScaleRange.x, json.spriteScaleRange.y))
    if (typeof json.fogColor === 'number') component.fogColor.set(new Color(json.fogColor))
    if (typeof json.fogRange === 'object') component.fogRange.set(new Vector2(json.fogRange.x, json.fogRange.y))
  },
  toJSON(entity, component) {
    return {
      texture: component.texture.value,
      worldScale: component.worldScale.value,
      dimensions: component.dimensions.value,
      noiseZoom: component.noiseZoom.value,
      noiseOffset: component.noiseOffset.value,
      spriteScaleRange: component.spriteScaleRange.value,
      fogColor: component.fogColor.value.getHex(),
      fogRange: component.fogRange.value
    }
  },
  errors: ['TEXTURE_LOADING_ERROR']
})

export const SCENE_COMPONENT_CLOUD = 'cloud'
export const SCENE_COMPONENT_CLOUD_DEFAULT_VALUES = {
  texture: '/clouds/cloud.png',
  worldScale: { x: 1000, y: 150, z: 1000 } as Vector3,
  dimensions: { x: 8, y: 4, z: 8 } as Vector3,
  noiseZoom: { x: 7, y: 11, z: 7 } as Vector3,
  noiseOffset: { x: 0, y: 4000, z: 3137 } as Vector3,
  spriteScaleRange: { x: 50, y: 100 } as Vector2,
  fogColor: 0x4584b4,
  fogRange: { x: -100, y: 3000 } as Vector2
}
