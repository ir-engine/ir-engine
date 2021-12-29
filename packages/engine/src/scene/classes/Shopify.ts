import { Object3D } from 'three'
export default class Shopify extends Object3D {
  extendType: string
  shopifyProducts: any
  shopifyProductItems: any
  _shopifyDomain: any
  _shopifyToken: any
  _shopifyProductId: any
  _shopifyProductItemId: any
  constructor() {
    super()
    ;(this as any).type = 'Shopify'
    this.shopifyProducts = []
    this.shopifyProductItems = []
    this._shopifyDomain = ''
    this._shopifyToken = ''
  }
  get shopifyDomain() {
    return this._shopifyDomain
  }
  set shopifyDomain(value) {
    this._shopifyDomain = value
  }
  get shopifyToken() {
    return this._shopifyToken
  }
  set shopifyToken(value) {
    this._shopifyToken = value
  }
  get shopifyProductId() {
    return this._shopifyProductId
  }
  set shopifyProductId(value) {
    this._shopifyProductId = value
  }

  get shopifyProductItemId() {
    return this._shopifyProductItemId
  }
  set shopifyProductItemId(value) {
    this._shopifyProductItemId = value
  }
}
