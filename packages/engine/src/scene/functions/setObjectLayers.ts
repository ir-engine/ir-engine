import { Object3D } from 'three'
import { ObjectLayers } from '../constants/ObjectLayers'
import { Engine } from '../../ecs/classes/Engine'

export function setObjectLayers(object: Object3D, ...layers: number[]) {
  object.traverse((obj: Object3D) => {
    obj.layers.disableAll()
    for (const layer of layers) {
      obj.layers.enable(layer)
    }
  })

  for (const layerKey of Object.keys(ObjectLayers)) {
    const layer = ObjectLayers[layerKey]
    const hasLayer = object.layers.isEnabled(layer)
    Engine.objectLayerList[layer] = Engine.objectLayerList[layer] || new Set()
    if (hasLayer) Engine.objectLayerList[layer].add(object)
    else Engine.objectLayerList[layer].delete(object)
  }
}
