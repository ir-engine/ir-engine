import * as Comlink from 'comlink'
import createGeometry from '../functions/createGeometry'
import { IStyles } from '../styles'
import { SupportedFeature } from '../types'

export interface WorkerApi {
  handle: (
    feature: SupportedFeature,
    style: IStyles
  ) => {
    geometry: {
      json: {
        data: {
          index: any
        }
      }
      transfer: {
        attributes: { [attributeName: string]: { array: Int32Array; itemSize: number; normalized: boolean } }
      }
    }
  }
}

function createGeometryInWorker(feature: SupportedFeature, style: IStyles) {
  const geometry = createGeometry(feature, style)

  const attributes = {}
  for (let attributeName of Object.keys(geometry.attributes)) {
    const attribute = geometry.getAttribute(attributeName)
    const array = attribute.array as Float32Array
    Comlink.transfer(array, [array.buffer])
    attributes[attributeName] = {
      array,
      itemSize: attribute.itemSize,
      normalized: attribute.normalized,
      type: attribute.array.constructor.name
    }
  }

  const index = geometry.getIndex()
  const json = geometry.toJSON()

  json.data = {
    attributes
  }

  if (index) {
    Comlink.transfer(index.array, [(index.array as Float32Array).buffer])
    json.data.index = {
      array: index.array,
      type: index.array.constructor.name
    }
  }

  return { geometry: { json } }
}

Comlink.expose({
  handle: createGeometryInWorker
} as WorkerApi)
