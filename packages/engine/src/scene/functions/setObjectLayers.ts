import { Object3D } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { ObjectLayers } from '../constants/ObjectLayers'

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
    Engine.instance.objectLayerList[layer] = Engine.instance.objectLayerList[layer] || new Set()
    if (hasLayer) Engine.instance.objectLayerList[layer].add(object)
    else Engine.instance.objectLayerList[layer].delete(object)
  }
}
