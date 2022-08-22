import { Object3D } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { ObjectLayers } from '../constants/ObjectLayers'

export function updateWorldObjectLayers(object: Object3D) {
  for (const layerKey of Object.keys(ObjectLayers)) {
    const layer = ObjectLayers[layerKey]
    const hasLayer = object.layers.isEnabled(layer)
    Engine.instance.currentWorld.objectLayerList[layer] =
      Engine.instance.currentWorld.objectLayerList[layer] || new Set()
    if (hasLayer) Engine.instance.currentWorld.objectLayerList[layer].add(object)
    else Engine.instance.currentWorld.objectLayerList[layer].delete(object)
  }
}

export function setObjectLayers(object: Object3D, ...layers: number[]) {
  object.traverse((obj: Object3D) => {
    obj.layers.disableAll()
    for (const layer of layers) {
      obj.layers.enable(layer)
    }
  })
  updateWorldObjectLayers(object)
}

export function enableObjectLayer(object: Object3D, layer: number, enable: boolean) {
  object.traverse((obj: Object3D) => {
    enable ? obj.layers.enable(layer) : obj.layers.disable(layer)
  })
  updateWorldObjectLayers(object)
}
