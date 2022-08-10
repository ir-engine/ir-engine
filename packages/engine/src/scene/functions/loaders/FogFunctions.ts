import { Color, Fog, FogExp2, Mesh, MeshStandardMaterial } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { OBCType } from '../../../common/constants/OBCTypes'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { addOBCPlugin, PluginType, removeOBCPlugin } from '../../../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  getComponentCountOfType,
  removeComponent
} from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '../../../ecs/functions/EntityTreeFunctions'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { FogComponent, FogComponentType } from '../../components/FogComponent'
import { FogType } from '../../constants/FogType'
import { initBrownianMotionFogShader, initHeightFogShader, removeFogShader } from '../FogShaders'
import { ScenePrefabs } from '../registerPrefabs'
import { createNewEditorNode } from '../SceneLoading'

export const SCENE_COMPONENT_FOG = 'fog'
export const SCENE_COMPONENT_FOG_DEFAULT_VALUES = {
  type: FogType.Linear,
  color: '#FFFFFF',
  density: 0.005,
  near: 1,
  far: 1000,
  timeScale: 1,
  height: 0.05
}

export const deserializeFog: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson<FogComponentType>) => {
  const props = parseFogProperties(json.props)
  addComponent(entity, FogComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_FOG)

  updateFog(entity, props)
}

export const updateFog: ComponentUpdateFunction = (entity: Entity, properties: FogComponentType) => {
  const component = getComponent(entity, FogComponent)
  const scene = Engine.instance.currentWorld.scene

  if (typeof properties.type !== 'undefined') {
    switch (component.type) {
      case FogType.Linear:
        scene.fog = new Fog(component.color, component.near, component.far)
        removeFogShader()
        restoreMaterialForFog(entity)
        break

      case FogType.Exponential:
        scene.fog = new FogExp2(component.color.getHex(), component.density)
        removeFogShader()
        restoreMaterialForFog(entity)
        break

      case FogType.Brownian:
        scene.fog = new FogExp2(component.color.getHex(), component.density)
        initBrownianMotionFogShader()
        if (getEngineState().sceneLoaded.value) setupMaterialForFog(entity)
        else matchActionOnce(EngineActions.sceneLoaded.matches, () => setupMaterialForFog(entity))
        break

      case FogType.Height:
        scene.fog = new FogExp2(component.color.getHex(), component.density)
        initHeightFogShader()
        if (getEngineState().sceneLoaded.value) setupMaterialForFog(entity)
        else matchActionOnce(EngineActions.sceneLoaded.matches, () => setupMaterialForFog(entity))
        break

      default:
        scene.fog = null
        removeFogShader()
        restoreMaterialForFog(entity)
        break
    }
  }

  if (scene.fog) {
    if (typeof properties.color !== 'undefined') scene.fog.color.set(component.color)

    if (component.type === FogType.Linear) {
      if (typeof properties.near !== 'undefined') (scene.fog as Fog).near = component.near
      if (typeof properties.far !== 'undefined') (scene.fog as Fog).far = component.far
    } else {
      // For Exponential, Brownian and Hieght fog
      if (typeof properties.density !== 'undefined') (scene.fog as FogExp2).density = component.density

      if (component.type !== FogType.Exponential) {
        // For Brownian and Hieght fog
        if (typeof properties.height !== 'undefined') {
          component.shaders?.forEach((s) => (s.uniforms.heightFactor.value = component.height))
        }
      }

      if (component.type === FogType.Brownian) {
        component.shaders?.forEach((s) => (s.uniforms.fogTimeScale.value = component.timeScale))
      }
    }
  }
}

export const serializeFog: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, FogComponent) as FogComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_FOG,
    props: {
      type: component.type,
      color: component.color.getHex(),
      near: component.near,
      far: component.far,
      density: component.density,
      height: component.height,
      timeScale: component.timeScale
    }
  }
}

const parseFogProperties = (props): FogComponentType => {
  return {
    type: props.type ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.type,
    color: new Color(props.color ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.color),
    density: props.density ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.density,
    near: props.near ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.near,
    far: props.far ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.far,
    height: props.height ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.height,
    timeScale: props.timeScale ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.timeScale
  }
}

export const shouldDeserializeFog: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(FogComponent) <= 0
}

const setupMaterialForFog = (entity: Entity) => {
  Engine.instance.currentWorld.scene.traverse((obj: Mesh<any, MeshStandardMaterial>) => {
    if (typeof obj.material === 'undefined' || !obj.material.fog) return
    obj.material.userData.fogPlugin = getFogPlugin(entity)
    addOBCPlugin(obj.material, obj.material.userData.fogPlugin)
    obj.material.needsUpdate = true
  })
}

const restoreMaterialForFog = (entity: Entity) => {
  Engine.instance.currentWorld.scene.traverse((obj: Mesh<any, MeshStandardMaterial>) => {
    if (typeof obj.material === 'undefined') return
    if (obj.material.userData.fogPlugin) {
      removeOBCPlugin(obj.material, obj.material.userData.fogPlugin)
      delete obj.material.userData.fogPlugin
    }

    // material.needsUpdate is not working. Therefore have to invalidate the cache manually
    const key = Math.random()
    obj.material.customProgramCacheKey = () => key.toString()
  })

  const component = getComponent(entity, FogComponent)
  component.shaders = []
}

const getFogPlugin = (entity: Entity): PluginType => {
  return {
    id: OBCType.FOG,
    priority: 0,
    compile: (shader) => {
      const component = getComponent(entity, FogComponent)
      if (!component.shaders) component.shaders = []
      component.shaders.push(shader)

      shader.uniforms.fogTime = { value: 0.0 }
      shader.uniforms.fogTimeScale = { value: 1 }
      shader.uniforms.heightFactor = { value: component.height }
    }
  }
}

export const createFogFromSceneNode = (sceneEntity: Entity) => {
  const fogComponent = getComponent(sceneEntity, FogComponent)
  removeComponent(sceneEntity, FogComponent)

  const entityNode = getComponent(sceneEntity, EntityNodeComponent)
  const index = entityNode.components.indexOf(SCENE_COMPONENT_FOG)
  if (index > -1) entityNode.components.splice(index, 1)

  const fogNode = createEntityNode(createEntity())
  createNewEditorNode(fogNode, ScenePrefabs.fog)

  const newFogComponent = getComponent(fogNode.entity, FogComponent)
  newFogComponent.type = fogComponent.type
  newFogComponent.color = fogComponent.color
  newFogComponent.density = fogComponent.density
  newFogComponent.near = fogComponent.near
  newFogComponent.far = fogComponent.far
  newFogComponent.height = fogComponent.height
  newFogComponent.shaders = fogComponent.shaders
  newFogComponent.timeScale = fogComponent.timeScale

  addEntityNodeInTree(fogNode, Engine.instance.currentWorld.entityTree.rootNode)
  updateFog(fogNode.entity, newFogComponent)
}
