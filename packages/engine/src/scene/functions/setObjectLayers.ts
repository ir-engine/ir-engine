import { Object3D } from 'three'
import { ObjectLayers } from '../constants/ObjectLayers'
import { useEngine } from '../../ecs/classes/Engine'

export function setObjectLayers(object: Object3D, ...layers: number[]) {
  object.traverse((obj: Object3D) => {
    obj.layers.disableAll()
    for (const layer of layers) {
      obj.layers.enable(layer)
    }
  })

  for (const layerKey of Object.keys(ObjectLayers)) {
    const layer = ObjectLayers[layerKey]
    // @ts-ignore
    const hasLayer = object.layers.isEnabled(layer)
    useEngine().objectLayerList[layer] = useEngine().objectLayerList[layer] || new Set()
    if (hasLayer) useEngine().objectLayerList[layer].add(object)
    else useEngine().objectLayerList[layer].delete(object)
  }
}
