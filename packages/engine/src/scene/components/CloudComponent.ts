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
  jsonID: 'cloud',
  onInit: () => {
    return {
      texture: '/clouds/cloud.png',
      worldScale: new Vector3(1000, 150, 1000),
      dimensions: new Vector3(8, 4, 8),
      noiseZoom: new Vector3(7, 11, 7),
      noiseOffset: new Vector3(0, 4000, 3137),
      spriteScaleRange: new Vector2(50, 100),
      fogColor: new Color(0x4584b4),
      fogRange: new Vector2(-100, 3000)
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
      fogColor: component.fogColor.value,
      fogRange: component.fogRange.value
    }
  },
  errors: ['TEXTURE_LOADING_ERROR']
})
