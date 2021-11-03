import { DirectionalLight } from 'three'
import { DefautSceneEntityShape, EntityComponentDataType, getShapeOfEntity } from '../../common/constants/Object3DClassMap'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import EntityTree from '../../ecs/classes/EntityTree'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { configureCSM, handleRendererSettings } from '../functions/handleRendererSettings'
import { SceneData } from '@xrengine/common/src/interfaces/SceneData'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { SceneOptions } from '../systems/SceneObjectSystem'
import { ComponentNames } from '../../common/constants/ComponentNames'

export enum SCENE_ASSET_TYPES {
  ENVMAP
}

export type SceneLoadParams = {
  directionalLights?: DirectionalLight[]
  isCSMEnabled?: boolean
  isEditor?: boolean
  generateEntityTree?: boolean
}

export class WorldScene {
  loadedModels = 0
  loaders: Promise<void>[] = []
  entityMap = {}
  static callbacks: any
  static isLoading = false

  constructor(private onProgress?: Function) {}

  loadScene = (
    scene: SceneData,
    params: SceneLoadParams = {
      generateEntityTree: false,
      directionalLights: [],
      isCSMEnabled: true,
      isEditor: false
    }
  ): Promise<void> => {
    WorldScene.callbacks = {}
    WorldScene.isLoading = true

    params.directionalLights = []
    params.isCSMEnabled = true

    // reset renderer settings for if we are teleporting and the new scene does not have an override
    configureCSM(null!, true)
    handleRendererSettings(null!, true)
    SceneOptions.instance = new SceneOptions()

    Object.keys(scene.entities).forEach((key) => {
      this.loadComponents(scene.entities[key], params)
    })

    if (params?.generateEntityTree) {
      const world = useWorld()

      if (!world.entityTree) world.entityTree = new EntityTree()

      const tree = world.entityTree
      Object.keys(scene.entities).forEach((key) => {
        const sceneEntity = scene.entities[key]
        tree.addEntity(this.entityMap[sceneEntity.entityId], this.entityMap[sceneEntity.parent])
      })
    }

    return Promise.all(this.loaders)
      .then(() => {
        WorldScene.isLoading = false
        Engine.sceneLoaded = true

        configureCSM(params.directionalLights!, !params.isCSMEnabled)

        EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED })
      })
      .catch((err) => {
        console.error('Error while loading the scene entities =>', err)
      })
  }

  _onModelLoaded = () => {
    this.loadedModels++
    if (typeof this.onProgress === 'function') this.onProgress(this.loaders.length - this.loadedModels)
  }

  static pushAssetTypeLoadCallback = (assetType: SCENE_ASSET_TYPES, callback: () => void): void => {
    if (!WorldScene.callbacks[assetType]) WorldScene.callbacks[assetType] = []
    WorldScene.callbacks[assetType].push(callback)
  }

  static executeAssetTypeLoadCallback = (assetType: SCENE_ASSET_TYPES, ...params: any[]): void => {
    WorldScene.callbacks[assetType]?.forEach((cb) => {
      cb(...params)
    })
  }

  loadComponents = (sceneEntity: any, sceneProperty: SceneLoadParams): void => {
    const entity = createEntity()
    this.entityMap[sceneEntity.entityId] = entity

    const components = {} as EntityComponentDataType
    const componentNames = sceneEntity.components.map(comp => {
      // remove '-1', '-2' etc suffixes
      const name = comp.name.replace(/(-\d+)|(\s)/g, '')
      components[name] = comp.data
      return comp.name
    })

    components[ComponentNames.NAME] = { name: sceneEntity.name }

    const entityShape = getShapeOfEntity(componentNames)

    if (entityShape) entityShape.create(entity, components, { sceneProperty })
    else DefautSceneEntityShape.create(entity, components)
  }

  static load = (scene: SceneData, onProgress?: Function, params?: SceneLoadParams): Promise<void> => {
    const world = new WorldScene(onProgress)
    return world.loadScene(scene, params)
  }
}
