import Shopify from '@xrengine/engine/src/scene/classes/Shopify'
import EditorNodeMixin from './EditorNodeMixin'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import axios from 'axios'
import { ImageAlphaMode } from '@xrengine/engine/src/scene/classes/Image'
import ModelNode from './ModelNode'
import VideoNode from './VideoNode'
import ImageNode from './ImageNode'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

export default class ShopifyNode extends EditorNodeMixin(Shopify) {
  static nodeName = 'Shopify'
  static legacyComponentName = 'shopify'
  static initialElementProps = {
    shopifyDomain: '',
    shopifyProducts: [],
    shopifyToken: '',
    shopifyProductId: '',
    shopifyProductItems: [],
    shopifyProductItemId: '',
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
          shopifyProducts,
          shopifyDomain,
          shopifyToken,
          shopifyProductId,
          shopifyProductItems,
          shopifyProductItemId
        } = json.components.find((c) => c.name === 'shopify').props

        if (shopifyProducts) node.shopifyProducts = shopifyProducts
        if (shopifyProductItems) node.shopifyProductItems = shopifyProductItems
        if (shopifyDomain) node._shopifyDomain = shopifyDomain
        if (shopifyToken) node._shopifyToken = shopifyToken
        if (shopifyProductId) node._shopifyProductId = shopifyProductId
        if (shopifyProductItemId) node._shopifyProductItemId = shopifyProductItemId
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
              Engine.scene.traverse((obj) => {
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

  //shopify properties
  get shopifyDomain() {
    return this._shopifyDomain
  }
  set shopifyDomain(value) {
    this._shopifyDomain = value
    this.getShopifyProduction()
  }
  get shopifyToken() {
    return this._shopifyToken
  }
  set shopifyToken(value) {
    this._shopifyToken = value
    this.getShopifyProduction()
  }
  get shopifyProductId() {
    return this._shopifyProductId
  }
  set shopifyProductId(value) {
    this._shopifyProductId = value
    this.shopifyProductItems = []
    let modelCount = 0
    let videoCount = 0
    let imageCount = 0
    this.initInteractive()
    this.shopifyProductItemId = ''

    if (this.shopifyProducts && this.shopifyProducts.length != 0) {
      const filtered = this.shopifyProducts.filter((product) => product.value == value)
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
            this.shopifyProductItems.push({
              value: index,
              label,
              media
            })
          })
        }
      }
    }
  }
  get shopifyProductItemId() {
    return this._shopifyProductItemId
  }
  set shopifyProductItemId(value) {
    this._shopifyProductItemId = value
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

    if (!this.shopifyProductItems[index] || !this.shopifyProductItems[index].media) return

    const media = this.shopifyProductItems[index].media
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

    //TODO active interactable
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

  async getShopifyProduction() {
    if (!this.shopifyDomain || this.shopifyDomain == '' || !this.shopifyToken || this.shopifyToken == '') return
    try {
      const res = await axios.post(
        `${this.shopifyDomain}/api/2021-07/graphql.json`,
        {
          query: `
            query {
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    description
                    onlineStoreUrl 
                  }
                }
              }
            }
        `
        },
        { headers: { 'X-Shopify-Storefront-Access-Token': this.shopifyToken, 'Content-Type': 'application/json' } }
      )
      if (!res || !res.data) return

      this.initInteractive()

      const productData: any = res.data
      this.shopifyProducts = []
      this.shopifyProductItems = []
      this.shopifyProductItemIndex = ''
      if (productData.data && productData.data.products && productData.data.products.edges) {
        for (const edgeProduct of productData.data.products.edges) {
          //TODO: interact data
          const response = await axios.post(
            `${this.shopifyDomain}/api/2021-07/graphql.json`,
            {
              query: `
                query {
                  node(id: "${edgeProduct.node.id}") {
                    ...on Product {
                      id
                        media(first: 250) {
                        edges {
                          node {
                            mediaContentType
                            alt
                            ...mediaFieldsByType
                          }
                        }
                      }
                    }
                  }
                }
                
                fragment mediaFieldsByType on Media {
                  ...on ExternalVideo {
                    id
                    host
                    embeddedUrl
                  }
                  ...on MediaImage {
                    image {
                      originalSrc
                    }
                  }
                  ...on Model3d {
                    sources {
                      url
                      mimeType
                      format
                      filesize
                    }
                  }
                  ...on Video {
                    sources {
                      url
                      mimeType
                      format
                      height
                      width
                    }
                  }
                }
                
            `
            },
            { headers: { 'X-Shopify-Storefront-Access-Token': this.shopifyToken, 'Content-Type': 'application/json' } }
          )
          if (response && response.data) {
            const mediaData: any = response.data
            if (mediaData.data && mediaData.data.node && mediaData.data.node.media && mediaData.data.node.media.edges) {
              const sourceData = []
              for (const edgeMedia of mediaData.data.node.media.edges) {
                if (edgeMedia.node && edgeMedia.node.sources && edgeMedia.node.sources[0]) {
                  let sourceValue = edgeMedia.node.sources[0]
                  if (sourceValue.format == 'glb') {
                    //3d model
                    sourceValue.extendType = 'model'
                  } else {
                    sourceValue.extendType = 'video'
                  }
                  sourceData.push(sourceValue)
                } else if (edgeMedia.node.image && edgeMedia.node.image.originalSrc) {
                  sourceData.push({
                    url: edgeMedia.node.image.originalSrc,
                    mimeType: 'image/png',
                    format: 'png',
                    extendType: 'image'
                  })
                }
              }
              this.shopifyProducts.push({
                title: edgeProduct.node.title,
                description: edgeProduct.node.description,
                storeUrl: edgeProduct.node.onlineStoreUrl,
                value: edgeProduct.node.id,
                label: edgeProduct.node.title,
                media: sourceData
              })
            }
          }
        }
        console.log(this.shopifyProducts)
        CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, [this])
        CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
      }
    } catch (error) {
      this.shopifyProducts = []
      console.error(error)
    }
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
      shopify: {
        shopifyProducts: this.shopifyProducts,
        shopifyDomain: this._shopifyDomain,
        shopifyToken: this._shopifyToken,
        shopifyProductId: this._shopifyProductId,
        shopifyProductItemId: this._shopifyProductItemId,
        shopifyProductItems: this.shopifyProductItems,
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
