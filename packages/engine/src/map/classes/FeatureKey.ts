import { ILayerName, ITuple } from '../types'

export default class FeatureKey implements ITuple {
  private _hash: string
  private _layerId: ILayerName
  private _tileX: number
  private _tileY: number
  private _indexInTile: string

  constructor(layerName: ILayerName, x: number, y: number, indexInTile: string) {
    this._layerId = layerName
    this._tileX = x
    this._tileY = y
    this._indexInTile = indexInTile
    this._hash = `${this._layerId},${this._tileX},${this._tileY},${this._indexInTile}`
  }

  get hash() {
    return this._hash
  }

  get 0() {
    return this._layerId
  }
  get 1() {
    return this._tileX
  }
  get 2() {
    return this._tileY
  }
  get 3() {
    return this._indexInTile
  }
}
