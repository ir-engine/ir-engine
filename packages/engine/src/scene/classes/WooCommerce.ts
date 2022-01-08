import { Object3D } from 'three'

export default class WooCommerce extends Object3D {
  extendType: string
  wooCommerceProducts: any
  wooCommerceProductItems: any
  _wooCommerceDomain: any
  _wooCommerceConsumerKey: any
  _wooCommerceConsumerSecret: any
  _wooCommerceProductId: any
  _wooCommerceProductItemId: any
  constructor() {
    super()
    ;(this as any).type = 'WooCommerce'
    this.wooCommerceProducts = []
    this.wooCommerceProductItems = []
    this._wooCommerceDomain = ''
    this._wooCommerceConsumerSecret = ''
  }
  get wooCommerceDomain() {
    return this._wooCommerceDomain
  }
  set wooCommerceDomain(value) {
    this._wooCommerceDomain = value
  }
  get wooCommerceConsumerKey() {
    return this._wooCommerceConsumerKey
  }
  set wooCommerceConsumerKey(value) {
    this._wooCommerceConsumerKey = value
  }
  get wooCommerceConsumerSecret() {
    return this._wooCommerceConsumerSecret
  }
  set wooCommerceConsumerSecret(value) {
    this._wooCommerceConsumerSecret = value
  }
  get wooCommerceProductId() {
    return this._wooCommerceProductId
  }
  set wooCommerceProductId(value) {
    this._wooCommerceProductId = value
  }

  get wooCommerceProductItemId() {
    return this._wooCommerceProductItemId
  }
  set wooCommerceProductItemId(value) {
    this._wooCommerceProductItemId = value
  }
}
