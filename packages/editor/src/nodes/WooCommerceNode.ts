import WooCommerce from '@xrengine/engine/src/scene/classes/WooCommerce'
import EditorNodeMixin from './EditorNodeMixin'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { SceneManager } from '../managers/SceneManager'
import axios from 'axios'
import OAuth from 'oauth-1.0a'
import CryptoJS from 'crypto-js'
import { ImageAlphaMode } from '@xrengine/engine/src/scene/classes/Image'

import ModelNode from './ModelNode'
import VideoNode from './VideoNode'
import ImageNode from './ImageNode'

export default class WooCommerceNode extends EditorNodeMixin(WooCommerce) {
  static nodeName = 'WooCommerce'
  static legacyComponentName = 'wooCommerce'
  static initialElementProps = {
    wooCommerceDomain: '',
    wooCommerceProducts: [],
    wooCommerceConsumerSecret: '',
    wooCommerceConsumerKey: '',
    wooCommerceProductId: '',
    wooCommerceProductItems: [],
    wooCommerceProductItemId: '',
    extendType: ''
  }

  extendNode: any

  static async deserialize(json, loadAsync, onError) {
    const node = await super.deserialize(json)
    loadAsync(
      (async () => {
        const {
          extend,
          extendType,
          wooCommerceProducts,
          wooCommerceDomain,
          wooCommerceConsumerSecret,
          wooCommerceConsumerKey,
          wooCommerceProductId,
          wooCommerceProductItems,
          wooCommerceProductItemId
        } = json.components.find((c) => c.name === 'wooCommerce').props

        if (wooCommerceProducts) node.wooCommerceProducts = wooCommerceProducts
        if (wooCommerceProductItems) node.wooCommerceProductItems = wooCommerceProductItems
        if (wooCommerceDomain) node._wooCommerceDomain = wooCommerceDomain
        if (wooCommerceConsumerSecret) node._wooCommerceConsumerSecret = wooCommerceConsumerSecret
        if (wooCommerceConsumerKey) node._wooCommerceConsumerKey = wooCommerceConsumerKey
        if (wooCommerceProductId != undefined) node._wooCommerceProductId = wooCommerceProductId
        if (wooCommerceProductItemId != undefined) node._wooCommerceProductItemId = wooCommerceProductItemId
        if (extendType) node.extendType = extendType

        if (extendType == 'model') {
          node.extendNode = new ModelNode()
          node.extendNode.initialScale = 'fit'

          await node.extendNode.load(extend.src, onError)

          if (node.extendNode.envMapOverride) node.extendNode.envMapOverride = extend.envMapOverride

          if (extend.textureOverride) {
            // Using this to pass texture override uuid to event callback instead of creating a new variable
            node.extendNode.textureOverride = extend.textureOverride
            CommandManager.instance.addListener(EditorEvents.PROJECT_LOADED.toString(), () => {
              SceneManager.instance.scene.traverse((obj) => {
                if (obj.uuid === node.extendNode.textureOverride) {
                  node.extendNode.textureOverride = obj.uuid
                }
              })
            })
          }

          node.extendNode.collidable = extend.collidable
          node.extendNode.walkable = extend.walkable

          //Todo need to check again with animated model
          const loopAnimationComponent = extend['loop-animation']
          if (loopAnimationComponent && loopAnimationComponent.props) {
            const { clip, activeClipIndex, hasAvatarAnimations } = loopAnimationComponent.props
            node.extendNode.hasAvatarAnimations = hasAvatarAnimations
            if (activeClipIndex !== undefined) {
              node.extendNode.activeClipIndex = loopAnimationComponent.props.activeClipIndex
            } else if (clip !== undefined && node.extendNode.model && node.extendNode.model.animations) {
              // DEPRECATED: Old loop-animation component stored the clip name rather than the clip index
              // node.activeClipIndex = node.model.animations.findIndex(
              //   animation => animation.name === clip
              // );
              const clipIndex = node.extendNode.model.animations.findIndex((animation) => animation.name === clip)

              if (clipIndex !== -1) {
                node.extendNode.activeClipIndices = [clipIndex]
              }
            }
          }
          if (extend['castShadow']) {
            node.extendNode.castShadow = extend['castShadow']
            node.extendNode.receiveShadow = extend['receiveShadow']
          }
        } else if (extendType == 'video') {
          node.extendNode = new VideoNode()
          node.extendNode.src = extend.src
          await node.extendNode.load(extend.src, onError)
          node.extendNode.interactable = extend.interactable
          node.extendNode.isLivestream = extend.isLivestream
          node.extendNode.controls = extend.controls || false
          node.extendNode.autoPlay = extend.autoPlay
          node.extendNode.synchronize = extend.synchronize
          node.extendNode.loop = extend.loop
          node.extendNode.audioType = extend.audioType
          node.extendNode.volume = extend.volume
          node.extendNode.distanceModel = extend.distanceModel
          node.extendNode.rolloffFactor = extend.rolloffFactor
          node.extendNode.refDistance = extend.refDistance
          node.extendNode.maxDistance = extend.maxDistance
          node.extendNode.coneInnerAngle = extend.coneInnerAngle
          node.extendNode.coneOuterAngle = extend.coneOuterAngle
          node.extendNode.coneOuterGain = extend.coneOuterGain
          node.extendNode.projection = extend.projection
          node.extendNode.elementId = extend.elementId
        } else if (extendType == 'image') {
          node.extendNode = new ImageNode()
          await node.extendNode.load(extend.src, onError)
          node.controls = extend.controls || false
          node.alphaMode = extend.alphaMode === undefined ? ImageAlphaMode.Blend : extend.alphaMode
          node.alphaCutoff = extend.alphaCutoff === undefined ? 0.5 : extend.alphaCutoff
          node.projection = extend.projection
        }
        node.add(node.extendNode.children[0].clone())

        const interactableComponent = json.components.find((c) => c.name === 'interact')
        if (interactableComponent) {
          node.interactable = interactableComponent.props.interactable
          node.interactionType = interactableComponent.props.interactionType
          node.interactionText = interactableComponent.props.interactionText
          node.interactionDistance = interactableComponent.props.interactionDistance
          node.interactionThemeIndex = interactableComponent.props.interactionThemeIndex
          node.interactionName = interactableComponent.props.interactionName
          node.interactionDescription = interactableComponent.props.interactionDescription
          node.interactionImages = interactableComponent.props.interactionImages
          node.interactionVideos = interactableComponent.props.interactionVideos
          node.interactionUrls = interactableComponent.props.interactionUrls
          node.interactionModels = interactableComponent.props.interactionModels
        }
      })()
    )
    return node
  }

  constructor() {
    super()
  }

  initInteractive() {
    this.interactable = false
    this.interactionType = 'infoBox'
    this.interactionText = ''
    this.interactionThemeIndex = 0
    this.interactionName = ''
    this.interactionDescription = ''
    this.interactionImages = []
    this.interactionVideos = []
    this.interactionUrls = []
    this.interactionModels = []
  }

  //set properties from editor
  set activeClipIndex(value) {
    if (this.extendNode) this.extendNode.activeClipIndex = value
  }

  set hasAvatarAnimations(value) {
    if (this.extendNode) this.extendNode.hasAvatarAnimations = value
  }

  set textureOverride(value) {
    if (this.extendNode) this.extendNode.textureOverride = value
  }

  set castShadow(value) {
    if (this.extendNode) this.extendNode.castShadow = value
  }

  set receiveShadow(value) {
    if (this.extendNode) this.extendNode.receiveShadow = value
  }

  set isUpdateDataMatrix(value) {
    if (this.extendNode) this.extendNode.isUpdateDataMatrix = value
  }

  set isLivestream(value) {
    if (this.extendNode) this.extendNode.isLivestream = value
  }

  set projection(value) {
    if (this.extendNode) this.extendNode.projection = value
  }

  set elementId(value) {
    if (this.extendNode) this.extendNode.elementId = value
  }

  set controls(value) {
    if (this.extendNode) this.extendNode.controls = value
  }

  set alphaMode(value) {
    if (this.extendNode) this.extendNode.alphaMode = value
  }

  set alphaCutoff(value) {
    if (this.extendNode) this.extendNode.alphaCutoff = value
  }

  //wooCommerce properties
  get wooCommerceDomain() {
    return this._wooCommerceDomain
  }
  set wooCommerceDomain(value) {
    this._wooCommerceDomain = value
    this.getWooCommerceProduction()
  }
  get wooCommerceConsumerSecret() {
    return this._wooCommerceConsumerSecret
  }
  set wooCommerceConsumerSecret(value) {
    this._wooCommerceConsumerSecret = value
    this.getWooCommerceProduction()
  }
  get wooCommerceConsumerKey() {
    return this._wooCommerceConsumerKey
  }
  set wooCommerceConsumerKey(value) {
    this._wooCommerceConsumerKey = value
    this.getWooCommerceProduction()
  }
  get wooCommerceProductId() {
    return this._wooCommerceProductId
  }
  set wooCommerceProductId(value) {
    this._wooCommerceProductId = value
    this.wooCommerceProductItems = []
    let modelCount = 0
    let videoCount = 0
    let imageCount = 0
    this.initInteractive()
    if (this.wooCommerceProducts && this.wooCommerceProducts.length != 0) {
      const filtered = this.wooCommerceProducts.filter((product) => product.value == value)
      if (filtered && filtered.length != 0) {
        if (filtered[0] && filtered[0].media) {
          this.interactionName = filtered[0].title
          this.interactionText = filtered[0].title
          this.interactionDescription = filtered[0].description
          if (filtered[0].storeUrl) this.interactionUrls.push(filtered[0].storeUrl)
          filtered[0].media.forEach((media, index) => {
            let label = media.extendType.replace(/\b\w/g, (l) => l.toUpperCase())
            if (media.extendType == 'model') {
              modelCount++
              label += ` ${modelCount}`
              this.interactionModels.push(media.url)
            } else if (media.extendType == 'video') {
              videoCount++
              label += ` ${videoCount}`
              this.interactionVideos.push(media.url)
            } else {
              imageCount++
              label += ` ${imageCount}`
              this.interactionImages.push(media.url)
            }
            this.wooCommerceProductItems.push({
              value: index,
              label,
              media
            })
          })
        }
      }
    }
  }
  get wooCommerceProductItemId() {
    return this._wooCommerceProductItemId
  }
  set wooCommerceProductItemId(value) {
    this._wooCommerceProductItemId = value
    if (value !== '') this.interactable = true
    this.setMediaNode(value)
  }

  async setMediaNode(index) {
    while (this.children.length > 0) {
      this.remove(this.children[0])
    }
    if (this.extendNode && this.extendNode.dispose) {
      this.extendNode.dispose()
    }

    if (!this.wooCommerceProductItems[index] || !this.wooCommerceProductItems[index].media) return

    const media = this.wooCommerceProductItems[index].media
    this.extendType = media.extendType

    if (media.extendType == 'model') {
      this.extendNode = new ModelNode()
      this.extendNode.initialScale = 'fit'
    } else if (media.extendType == 'video') {
      this.extendNode = new VideoNode()
      this.extendNode.src = media.url
    } else if (media.extendType == 'image') {
      this.extendNode = new ImageNode()
    }

    await this.extendNode.load(media.url)
    this.add(this.extendNode.children[0].clone())
  }

  async getWooCommerceProduction() {
    if (
      !this.wooCommerceDomain ||
      this.wooCommerceDomain == '' ||
      !this.wooCommerceConsumerKey ||
      this.wooCommerceConsumerKey == '' ||
      !this.wooCommerceConsumerSecret ||
      this.wooCommerceConsumerSecret == ''
    )
      return
    try {
      const res = await this.makeRequest(
        this.wooCommerceDomain + '/wp-json/wc/v3/products',
        this.wooCommerceConsumerKey,
        this.wooCommerceConsumerSecret
      )
      if (!res || !res.data) return
      const productData: any = res.data
      this.initInteractive()
      this.wooCommerceProducts = []
      this.wooCommerceProductItems = []
      this.wooCommerceProductItemId = ''
      var urlRegex = /(https?:\/\/[^\s]+)/g
      if (productData && productData.length > 0) {
        productData.forEach((product) => {
          const sourceData = []
          var urls = product.description.match(urlRegex)
          urls.forEach((url) => {
            let extendType = ''
            let path = ''
            let type = ''
            if (url.match(/\.(jpeg|jpg|gif|png)/) != null) {
              const format = url.match(/\.(jpeg|jpg|gif|png)/)[0]
              type = url.match(/\.(jpeg|jpg|gif|png)/)[1]
              extendType = 'image'
              path = `${url.split(format)[0]}${format}`
            } else if (url.match(/\.(mp4|mkv|avi|mov|flv|wmv)/) != null) {
              const format = url.match(/\.(mp4|mkv|avi|mov|flv|wmv)/)[0]
              type = url.match(/\.(mp4|mkv|avi|mov|flv|wmv)/)[1]
              extendType = 'video'
              path = `${url.split(format)[0]}${format}`
            } else if (url.match(/\.(glb|glft|fbx|obj)/) != null) {
              const format = url.match(/\.(glb|glft|fbx|obj)/)[0]
              type = url.match(/\.(glb|glft|fbx|obj)/)[1]
              extendType = 'model'
              path = `${url.split(format)[0]}${format}`
            }
            if (extendType) {
              const filtered = sourceData.filter((data) => data.url == path)
              if (filtered.length == 0) {
                sourceData.push({
                  url: path,
                  format: type,
                  extendType
                })
              }
            }
          })
          this.wooCommerceProducts.push({
            title: product.name,
            description: product.short_description.replace(/(<([^>]+)>)/gi, ''),
            storeUrl: product.permalink,
            value: product.id,
            label: product.name,
            media: sourceData
          })
        })
      }

      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
      CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
    } catch (error) {
      this.wooCommerceProducts = []
      console.error(error)
    }
  }

  async makeRequest(url, ck, cs, method = 'GET') {
    //@ts-ignore
    const oauth = OAuth({
      consumer: {
        key: ck,
        secret: cs
      },
      signature_method: 'HMAC-SHA1',
      hash_function: function (base_string, key) {
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(base_string, key))
      }
    })
    const requestData = {
      url,
      method
    }
    const response = await axios.get(requestData.url, { params: oauth.authorize(requestData) })
    return response
  }

  reload() {
    console.log('reload')
    if (this.extendNode) this.extendNode.reload()
  }

  async serialize(projectID) {
    let extend: any
    if (this.extendType == 'model') {
      extend = {
        src: this.extendNode._canonicalUrl,
        envMapOverride: this.extendNode.envMapOverride !== '' ? this.extendNode.envMapOverride : undefined,
        textureOverride: this.extendNode.textureOverride,
        matrixAutoUpdate: this.extendNode.isUpdateDataMatrix,
        castShadow: this.extendNode.castShadow,
        receiveShadow: this.extendNode.receiveShadow
      }

      if (this.activeClipIndex !== -1) {
        extend['loop-animation'] = {
          activeClipIndex: this.extendNode.activeClipIndex,
          hasAvatarAnimations: this.extendNode.hasAvatarAnimations
        }
      }

      if (this.collidable) {
        extend['collidable'] = {}
      }

      if (this.walkable) {
        extend['walkable'] = {}
      }
    } else if (this.extendType == 'video') {
      extend = {
        src: this.extendNode.src,
        isLivestream: this.extendNode.isLivestream,
        controls: this.extendNode.controls,
        autoPlay: this.extendNode.autoPlay,
        synchronize: this.extendNode.synchronize,
        loop: this.extendNode.loop,
        audioType: this.extendNode.audioType,
        volume: this.extendNode.volume,
        distanceModel: this.extendNode.distanceModel,
        rolloffFactor: this.extendNode.rolloffFactor,
        refDistance: this.extendNode.refDistance,
        maxDistance: this.extendNode.maxDistance,
        coneInnerAngle: this.extendNode.coneInnerAngle,
        coneOuterAngle: this.extendNode.coneOuterAngle,
        coneOuterGain: this.extendNode.coneOuterGain,
        projection: this.extendNode.projection,
        elementId: this.extendNode.elementId
      }
    } else if (this.extendType == 'image') {
      extend = {
        src: this.extendNode._canonicalUrl,
        controls: this.extendNode.controls,
        alphaMode: this.extendNode.alphaMode,
        alphaCutoff: this.extendNode.alphaCutoff,
        projection: this.extendNode.projection
      }
    }

    const components = {
      wooCommerce: {
        wooCommerceProducts: this.wooCommerceProducts,
        wooCommerceDomain: this._wooCommerceDomain,
        wooCommerceConsumerKey: this._wooCommerceConsumerKey,
        wooCommerceConsumerSecret: this._wooCommerceConsumerSecret,
        wooCommerceProductId: this._wooCommerceProductId,
        wooCommerceProductItemId: this._wooCommerceProductItemId,
        wooCommerceProductItems: this.wooCommerceProductItems,
        extendType: this.extendType,
        extend
      },
      interact: {
        interactable: this.interactable,
        interactionType: this.interactionType,
        interactionText: this.interactionText,
        interactionDistance: this.interactionDistance,
        interactionThemeIndex: this.interactionThemeIndex,
        interactionName: this.interactionName,
        interactionDescription: this.interactionDescription,
        interactionImages: this.interactionImages,
        interactionVideos: this.interactionVideos,
        interactionUrls: this.interactionUrls,
        interactionModels: this.interactionModels
      }
    }
    return await super.serialize(projectID, components)
  }
}
