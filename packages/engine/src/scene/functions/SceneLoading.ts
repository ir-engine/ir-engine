import { DirectionalLight } from 'three'
import { Object3DClassMap } from '../../common/constants/Object3DClassMap'
import { ComponentRegisterFunction } from '../../common/functions/ComponentRegisterFunction'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import EntityTree from '../../ecs/classes/EntityTree'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { NameComponent } from '../components/NameComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { configureCSM, handleRendererSettings } from '../functions/handleRendererSettings'
import { SceneData } from '@xrengine/common/src/interfaces/SceneData'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'
import { useWorld } from '../../ecs/functions/SystemHooks'

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

  loadComponent = (entity: Entity, component: SceneDataComponent, sceneProperty: SceneLoadParams): void => {
    if (!component.sanitizedName) {
      // remove '-1', '-2' etc suffixes
      component.sanitizedName = component.name.replace(/(-\d+)|(\s)/g, '')
    }

    if (ComponentRegisterFunction[component.sanitizedName]) {
      ComponentRegisterFunction[component.sanitizedName]({ world: useWorld(), worldScene: this, entity, component, sceneProperty })
    } else {
      console.warn("Couldn't load Component", component.sanitizedName)
    }
  }

  loadComponents = (sceneEntity: any, sceneProperty: SceneLoadParams): void => {
    const entity = createEntity()

    this.entityMap[sceneEntity.entityId] = entity

    addComponent(entity, NameComponent, { name: sceneEntity.name })

    sceneEntity.components.forEach((component) => {
      component.data.sceneEntityId = sceneEntity.entityId

      // remove '-1', '-2' etc suffixes
      component.sanitizedName = component.name.replace(/(-\d+)|(\s)/g, '')

      if (Object3DClassMap[component.sanitizedName]) {
        let objClass = Object3DClassMap[component.sanitizedName]
        if (objClass.client || objClass.server) {
          if (isClient) addComponent(entity, Object3DComponent, { value: new objClass.client() })
          if (!isClient) addComponent(entity, Object3DComponent, { value: new objClass.server() })
        } else {
          addComponent(entity, Object3DComponent, { value: new objClass() })
        }
      }
    })

    sceneEntity.components.forEach((component) => {
      this.loadComponent(entity, component, sceneProperty)
    })
  }

  static load = (scene: SceneData, onProgress?: Function, params?: SceneLoadParams): Promise<void> => {
    const world = new WorldScene(onProgress)
    return world.loadScene(scene, params)
  }
}
