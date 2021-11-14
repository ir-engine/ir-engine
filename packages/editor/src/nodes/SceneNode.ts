import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { DistanceModelType } from '@xrengine/engine/src/scene/classes/AudioSource'
import { EnvMapProps, EnvMapSourceType, EnvMapTextureType } from '@xrengine/engine/src/scene/constants/EnvMapEnum'
import { FogType } from '@xrengine/engine/src/scene/constants/FogType'
import {
  Color,
  CubeTextureLoader,
  DataTexture,
  Fog,
  FogExp2,
  Group,
  LinearFilter,
  LinearToneMapping,
  Object3D,
  PCFSoftShadowMap,
  PMREMGenerator,
  RGBFormat,
  Scene,
  ShadowMapType,
  sRGBEncoding,
  TextureLoader,
  Vector3
} from 'three'
import MeshCombinationGroup from '../classes/MeshCombinationGroup'
import asyncTraverse from '../functions/asyncTraverse'
import getNodeWithUUID from '../functions/getNodeWithUUID'
import serializeColor from '../functions/serializeColor'
import sortEntities from '../functions/sortEntities'
import { isStatic, setStaticMode, StaticModes } from '../functions/StaticMode'
import { NodeManager } from '../managers/NodeManager'
import CubemapBakeNode from './CubemapBakeNode'
import EditorNodeMixin from './EditorNodeMixin'
import GroupNode from './GroupNode'

export default class SceneNode extends EditorNodeMixin(Scene) {
  static nodeName = 'Scene'
  static disableTransform = true
  static canAddNode() {
    return false
  }
  static async loadProject(json: SceneJson) {
    console.log(json)
    const { root, entities } = json
    let scene = null
    const dependencies = []
    function loadAsync(promise) {
      dependencies.push(promise)
    }
    const errors = []
    function onError(object, error) {
      errors.push(error)
    }
    const sortedEntities = sortEntities(entities)
    for (const entityId of sortedEntities) {
      const entity = entities[entityId]
      let EntityNodeConstructor
      for (const NodeConstructor of NodeManager.instance.nodeTypes) {
        if (NodeConstructor.shouldDeserialize(entity)) {
          EntityNodeConstructor = NodeConstructor
          break
        }
      }
      if (!EntityNodeConstructor) {
        console.warn(`No node constructor found for entity "${entity.name}"`)
      } else {
        try {
          const node = await EntityNodeConstructor.deserialize(entity, loadAsync, onError)
          node.uuid = entityId
          if (entity.parent) {
            const parent = getNodeWithUUID(scene, entity.parent)
            if (!parent) {
              throw new Error(
                `Node "${entity.name}" with uuid "${entity.uuid}" specifies parent "${entity.parent}", but was not found.`
              )
            }
            parent.children.splice(entity.index, 0, node)
            node.parent = parent
          } else if (entityId === root) {
            scene = node
            Engine.scene = scene
          } else {
            throw new Error(`Node "${entity.name}" with uuid "${entity.uuid}" does not specify a parent.`)
          }
        } catch (e) {
          console.error('Node failed to load - it will be removed', e)
          errors.push(e)
        }
      }
    }
    await Promise.all(dependencies)
    return [scene, errors]
  }
  static shouldDeserialize(entityJson) {
    return entityJson.parent === undefined
  }
  static async deserialize(json) {
    const node = await super.deserialize(json)
    if (json.components) {
      const mtdata = json.components.find((c) => c.name == 'mtdata')
      if (mtdata) {
        const { meta_data } = mtdata.props
        node.meta_data = meta_data
      }
      const fog = json.components.find((c) => c.name === 'fog')
      if (fog) {
        const { type, color, density, near, far } = fog.props
        node.fogType = type
        node.fogColor.set(color)
        node.fogDensity = density
        node.fogNearDistance = near
        node.fogFarDistance = far
      }
      const audioSettings = json.components.find((c) => c.name === 'audio-settings')
      if (audioSettings) {
        const props = audioSettings.props
        node.usePositionalAudio = props.usePositionalAudio
        node.avatarDistanceModel = props.avatarDistanceModel
        node.avatarRolloffFactor = props.avatarRolloffFactor
        node.avatarRefDistance = props.avatarRefDistance
        node.avatarMaxDistance = props.avatarMaxDistance
        node.mediaVolume = props.mediaVolume
        node.mediaDistanceModel = props.mediaDistanceModel
        node.mediaRolloffFactor = props.mediaRolloffFactor
        node.mediaRefDistance = props.mediaRefDistance
        node.mediaMaxDistance = props.mediaMaxDistance
        node.mediaConeInnerAngle = props.mediaConeInnerAngle
        node.mediaConeOuterAngle = props.mediaConeOuterAngle
        node.mediaConeOuterGain = props.mediaConeOuterGain
      }
      const simpleMaterials = json.components.find((c) => c.name === 'simple-materials')
      if (simpleMaterials) {
        const props = simpleMaterials.props
        node.simpleMaterials = props.simpleMaterials
      }
      const rendererSettings = json.components.find((c) => c.name === 'renderer-settings')
      if (rendererSettings) {
        const props = rendererSettings.props
        if (props.LODs) node.LODs.set(props.LODs.x, props.LODs.y, props.LODs.z)
        node.overrideRendererSettings = props.overrideRendererSettings
        node.csm = props.csm
        node.toneMapping = props.toneMapping
        node.toneMappingExposure = props.toneMappingExposure
        node.shadowMapType = props.shadowMapType
      }
      const envmapsettings = json.components.find((c) => c.name === 'envmap')
      if (envmapsettings) {
        const props = envmapsettings.props
        node._envMapSourceType = props.type
        node._envMapSourceURL = props.envMapSourceURL
        node.envMapTextureType = props.envMapTextureType
        node._envMapSourceColor = props.envMapSourceColor
        node._envMapIntensity = props.envMapIntensity
      }
    }
    return node
  }

  url = null

  meta_data = ''
  _fogType = FogType.Disabled
  _fog = new Fog(0xffffff, 0.0025)
  _fogExp2 = new FogExp2(0xffffff, 0.0025)
  fog = null

  usePositionalAudio = false
  avatarDistanceModel = DistanceModelType.Inverse
  avatarRolloffFactor = 2
  avatarRefDistance = 20
  avatarMaxDistance = 10000
  mediaVolume = 0.5
  mediaDistanceModel = DistanceModelType.Inverse
  mediaRolloffFactor = 1
  mediaRefDistance = 20
  mediaMaxDistance = 10000
  mediaConeInnerAngle = 360
  mediaConeOuterAngle = 0
  mediaConeOuterGain = 0

  simpleMaterials = false
  overrideRendererSettings = false
  csm = true
  shadows = true
  shadowType = true
  toneMapping = LinearToneMapping
  toneMappingExposure = 0.8
  shadowMapType: ShadowMapType = PCFSoftShadowMap
  LODs: Vector3 = new Vector3(5, 15, 30)

  //#region EnvironmentMap
  _envMapSourceType = EnvMapSourceType.Default
  envMapTextureType = EnvMapTextureType.Equirectangular
  _envMapSourceColor = ''
  _envMapSourceURL = ''
  errorInEnvmapURL = false
  _envMapIntensity = 1
  environmentNode: CubemapBakeNode = null
  //#endregion

  constructor() {
    super()
    setStaticMode(this, StaticModes.Static)
  }

  //#region EnvironmentMap

  get envMapSourceType() {
    return this._envMapSourceType
  }

  set envMapSourceType(type) {
    this._envMapSourceType = type
    this.setUpEnvironmentMap()
  }

  get envMapSourceURL() {
    return this._envMapSourceURL
  }

  set envMapSourceURL(src) {
    this._envMapSourceURL = src
    this.setUpEnvironmentMapTexture()
  }

  get envMapIntensity() {
    return this._envMapIntensity
  }

  set envMapIntensity(value) {
    this._envMapIntensity = value
    this.traverse((child) => {
      if (child.material) child.material.envMapIntensity = value
    })
  }

  get envMapSourceColor() {
    return this._envMapSourceColor
  }

  set envMapSourceColor(src) {
    this._envMapSourceColor = src
    this.setUpEnvironmentMapColor()
  }

  async setUpEnvironmentMapTexture() {
    const pmremGenerator = new PMREMGenerator(Engine.renderer)
    switch (this.envMapTextureType) {
      case EnvMapTextureType.Equirectangular:
        try {
          const texture = await new TextureLoader().loadAsync(this.envMapSourceURL)
          texture.encoding = sRGBEncoding
          texture.minFilter = LinearFilter
          this.environment = pmremGenerator.fromEquirectangular(texture).texture
          this.errorInEnvmapURL = false
          texture.dispose()
        } catch (error) {
          this.errorInEnvmapURL = true
          console.error(`Error loading image ${this.envMapSourceURL}`)
        }
        break
      case EnvMapTextureType.Cubemap:
        const negx = 'negx.jpg'
        const negy = 'negy.jpg'
        const negz = 'negz.jpg'
        const posx = 'posx.jpg'
        const posy = 'posy.jpg'
        const posz = 'posz.jpg'
        new CubeTextureLoader().setPath(this.envMapSourceURL).load(
          [posx, negx, posy, negy, posz, negz],
          (texture) => {
            const EnvMap = pmremGenerator.fromCubemap(texture).texture
            EnvMap.encoding = sRGBEncoding
            this.environment = EnvMap
            this.errorInEnvmapURL = false
            texture.dispose()
          },
          (res) => {
            console.log(res)
          },
          (erro) => {
            this.errorInEnvmapURL = true
            console.warn('Skybox texture could not be found!', erro)
          }
        )
        break
    }
    pmremGenerator.dispose()
    return this
  }

  async getEnvMapProps(projectId = null) {
    const envMapProps: EnvMapProps = {
      type: this.envMapSourceType,
      envMapIntensity: this._envMapIntensity
    }

    switch (this.envMapSourceType) {
      case EnvMapSourceType.Color:
        envMapProps.envMapSourceColor = this._envMapSourceColor
        break
      case EnvMapSourceType.Texture:
        envMapProps.envMapTextureType = this.envMapTextureType
        envMapProps.envMapSourceURL = this.envMapSourceURL
        break
      case EnvMapSourceType.Default:
      default:
        if (!this.environmentNode) break
        envMapProps.envMapCubemapBake = this.environmentNode.cubemapBakeSettings
        break
    }

    return envMapProps
  }

  setUpEnvironmentMap() {
    if (this.environment?.dispose) this.environment.dispose()
    switch (this._envMapSourceType) {
      case EnvMapSourceType.Default:
        this.environmentNode?.setEnvMap()
        break
      case EnvMapSourceType.Color:
        this.setUpEnvironmentMapColor()
        break
      case EnvMapSourceType.Texture:
        this.setUpEnvironmentMapTexture()
        break
    }
  }

  setUpEnvironmentMapColor() {
    const col = new Color(this.envMapSourceColor)
    const resolution = 1
    const data = new Uint8Array(3 * resolution * resolution)
    for (let i = 0; i < resolution * resolution; i++) {
      data[i] = Math.floor(col.r * 255)
      data[i + 1] = Math.floor(col.g * 255)
      data[i + 2] = Math.floor(col.b * 255)
    }
    const pmren = new PMREMGenerator(Engine.renderer)
    const texture = new DataTexture(data, resolution, resolution, RGBFormat)
    texture.encoding = sRGBEncoding
    this.environment = pmren.fromEquirectangular(texture).texture
    pmren.dispose()
  }

  registerEnvironmentMapNode(node: CubemapBakeNode) {
    this.environmentNode = node
  }
  unregisterEnvironmentMapNode(node: CubemapBakeNode) {
    if (this.environmentNode === node) this.environmentNode = null
  }

  //#endregion

  //#region  fog
  get fogType() {
    return this._fogType
  }

  set fogType(type) {
    this._fogType = type
    switch (type) {
      case FogType.Linear:
        this.fog = this._fog
        break
      case FogType.Exponential:
        this.fog = this._fogExp2
        break
      default:
        this.fog = null
        break
    }
  }

  get fogColor() {
    if (this.fogType === FogType.Linear) {
      return this._fog.color
    } else {
      return this._fogExp2.color
    }
  }

  get fogDensity() {
    return this._fogExp2.density
  }
  set fogDensity(value) {
    this._fogExp2.density = value
  }
  get fogNearDistance() {
    return this._fog.near
  }
  set fogNearDistance(value) {
    this._fog.near = value
  }
  get fogFarDistance() {
    return this._fog.far
  }
  set fogFarDistance(value) {
    this._fog.far = value
  }

  //#endregion

  copy(source, recursive = true) {
    super.copy(source, recursive)
    this.url = source.url
    this.meta_data = source.meta_data
    this.fogType = source.fogType

    this.fogColor.copy(source.fogColor)
    this.fogDensity = source.fogDensity
    this.fogNearDistance = source.fogNearDistance
    this.fogFarDistance = source.fogFarDistance

    this.usePositionalAudio = source.usePositionalAudio
    this.avatarDistanceModel = source.avatarDistanceModel
    this.avatarRolloffFactor = source.avatarRolloffFactor
    this.avatarRefDistance = source.avatarRefDistance
    this.avatarMaxDistance = source.avatarMaxDistance
    this.mediaVolume = source.mediaVolume
    this.mediaDistanceModel = source.mediaDistanceModel
    this.mediaRolloffFactor = source.mediaRolloffFactor
    this.mediaRefDistance = source.mediaRefDistance
    this.mediaMaxDistance = source.mediaMaxDistance
    this.mediaConeInnerAngle = source.mediaConeInnerAngle
    this.mediaConeOuterAngle = source.mediaConeOuterAngle
    this.mediaConeOuterGain = source.mediaConeOuterGain

    this.simpleMaterials = source.simpleMaterials

    this.LODs = source.LODs
    this.overrideRendererSettings = source.overrideRendererSettings
    this.csm = source.csm
    this.toneMapping = source.toneMapping
    this.toneMappingExposure = source.toneMappingExposure
    this.shadowMapType = source.toneMappingType

    return this
  }
  // @ts-ignore
  async serialize(sceneId): Promise<SceneJson> {
    const sceneJson: SceneJson = {
      version: 4,
      root: this.uuid,
      entities: {
        [this.uuid]: {
          name: this.name,
          components: [
            {
              name: 'mtdata',
              props: {
                meta_data: this.meta_data
              }
            },
            {
              name: 'fog',
              props: {
                type: this.fogType,
                color: serializeColor(this.fogColor),
                near: this.fogNearDistance,
                far: this.fogFarDistance,
                density: this.fogDensity
              }
            },
            {
              name: 'audio-settings',
              props: {
                usePositionalAudio: this.usePositionalAudio,
                avatarDistanceModel: this.avatarDistanceModel,
                avatarRolloffFactor: this.avatarRolloffFactor,
                avatarRefDistance: this.avatarRefDistance,
                avatarMaxDistance: this.avatarMaxDistance,
                mediaVolume: this.mediaVolume,
                mediaDistanceModel: this.mediaDistanceModel,
                mediaRolloffFactor: this.mediaRolloffFactor,
                mediaRefDistance: this.mediaRefDistance,
                mediaMaxDistance: this.mediaMaxDistance,
                mediaConeInnerAngle: this.mediaConeInnerAngle,
                mediaConeOuterAngle: this.mediaConeOuterAngle,
                mediaConeOuterGain: this.mediaConeOuterGain
              }
            },
            {
              name: 'simple-materials',
              props: {
                simpleMaterials: this.simpleMaterials
              }
            },
            {
              name: 'renderer-settings',
              props: {
                LODs: this.LODs,
                overrideRendererSettings: this.overrideRendererSettings,
                csm: this.csm,
                toneMapping: this.toneMapping,
                toneMappingExposure: this.toneMappingExposure,
                shadowMapType: this.shadowMapType
              }
            },
            {
              name: 'envmap',
              props: await this.getEnvMapProps(sceneId)
            }
          ]
        }
      }
    }

    const serializeCallback = async (child) => {
      if (!child.isNode || child === this) {
        return
      }
      const entityJson = await child.serialize(sceneId)
      entityJson.parent = child.parent.uuid
      let index = 0
      for (const sibling of child.parent.children) {
        if (sibling === child) {
          break
        } else if (sibling.isNode) {
          index++
        }
      }
      entityJson.index = index
      sceneJson.entities[child.uuid] = entityJson
    }
    await asyncTraverse(this, serializeCallback)
    return sceneJson
  }
  prepareForExport(ctx) {
    console.log('Preparing For Export')
    this.children = this.children.filter((c) => c.isNode)
    const nodeList = []
    this.traverse((child) => {
      if (child.isNode && child !== this) {
        nodeList.push(child)
      }
    })
    for (const node of nodeList) {
      node.prepareForExport(ctx)
    }
    if (this.fogType === FogType.Linear) {
      this.addGLTFComponent('fog', {
        type: this.fogType,
        color: serializeColor(this.fogColor),
        near: this.fogNearDistance,
        far: this.fogFarDistance
      })
    } else if (this.fogType === FogType.Exponential) {
      this.addGLTFComponent('fog', {
        type: this.fogType,
        color: serializeColor(this.fogColor),
        density: this.fogDensity
      })
    }
    if (this.usePositionalAudio) {
      this.addGLTFComponent('audio-settings', {
        avatarDistanceModel: this.avatarDistanceModel,
        avatarRolloffFactor: this.avatarRolloffFactor,
        avatarRefDistance: this.avatarRefDistance,
        avatarMaxDistance: this.avatarMaxDistance,
        mediaVolume: this.mediaVolume,
        mediaDistanceModel: this.mediaDistanceModel,
        mediaRolloffFactor: this.mediaRolloffFactor,
        mediaRefDistance: this.mediaRefDistance,
        mediaMaxDistance: this.mediaMaxDistance,
        mediaConeInnerAngle: this.mediaConeInnerAngle,
        mediaConeOuterAngle: this.mediaConeOuterAngle,
        mediaConeOuterGain: this.mediaConeOuterGain
      })
    }
    if (this.overrideRendererSettings) {
      this.addGLTFComponent('renderer-settings', {
        LODs: this.LODs,
        csm: this.csm,
        toneMapping: this.toneMapping,
        toneMappingExposure: this.toneMappingExposure,
        shadowMapType: this.shadowMapType
      })
    }
    if (this.simpleMaterials) {
      this.addGLTFComponent('simple-materials', {
        simpleMaterials: this.simpleMaterials
      })
    }
  }
  async combineMeshes() {
    await MeshCombinationGroup.combineMeshes(this)
  }
  removeUnusedObjects() {
    this.computeAndSetStaticModes()
    function hasExtrasOrExtensions(object) {
      const userData = object.userData
      for (const key in userData) {
        if (Object.prototype.hasOwnProperty.call(userData, key)) {
          return true
        }
      }
      return false
    }
    function _removeUnusedObjects(object) {
      let canBeRemoved = !!object.parent
      for (const child of object.children.slice(0)) {
        if (!_removeUnusedObjects(child)) {
          canBeRemoved = false
        }
      }
      const shouldRemove =
        canBeRemoved &&
        (object.constructor === Object3D ||
          object.constructor === Scene ||
          object.constructor === Group ||
          object.constructor === GroupNode) &&
        object.children.length === 0 &&
        isStatic(object) &&
        !hasExtrasOrExtensions(object)
      if (canBeRemoved && shouldRemove) {
        object.parent.remove(object)
        return true
      }
      return false
    }
    _removeUnusedObjects(this)
  }
  getAnimationClips() {
    const animations = []
    this.traverse((child) => {
      if (child.isNode && child.type === 'Model') {
        const activeClip = child.activeClip
        if (activeClip) {
          animations.push(child.activeClip)
        }
      }
    })
    return animations
  }
}
