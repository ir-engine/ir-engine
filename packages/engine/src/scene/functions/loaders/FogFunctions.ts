import { Color, Fog, FogExp2, Mesh, MeshStandardMaterial } from 'three'

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
  getComponent,
  getComponentCountOfType,
  removeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTreeFunctions'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { FogComponent, FogComponentType, SCENE_COMPONENT_FOG_DEFAULT_VALUES } from '../../components/FogComponent'
import { FogType } from '../../constants/FogType'
import { createNewEditorNode } from '../../systems/SceneLoadingSystem'
import { ScenePrefabs } from '../../systems/SceneObjectUpdateSystem'
import { initBrownianMotionFogShader, initHeightFogShader, removeFogShader } from '../FogShaders'

export const deserializeFog: ComponentDeserializeFunction = (entity: Entity, data: FogComponentType) => {
  const props = parseFogProperties(data)
  setComponent(entity, FogComponent, props)
}

export const updateFog: ComponentUpdateFunction = (entity: Entity) => {
  const fogComponent = getComponent(entity, FogComponent)
  const scene = Engine.instance.currentWorld.scene
  /** @todo replace _type with something better */

  if (!scene.fog || (scene.fog as any)._type !== fogComponent.type)
    switch (fogComponent.type) {
      case FogType.Linear:
        scene.fog = new Fog(fogComponent.color, fogComponent.near, fogComponent.far)
        removeFogShader()
        restoreMaterialForFog(entity)
        break

      case FogType.Exponential:
        scene.fog = new FogExp2(fogComponent.color.getHex(), fogComponent.density)
        removeFogShader()
        restoreMaterialForFog(entity)
        break

      case FogType.Brownian:
        scene.fog = new FogExp2(fogComponent.color.getHex(), fogComponent.density)
        initBrownianMotionFogShader()
        if (getEngineState().sceneLoaded.value) setupMaterialForFog(entity)
        else matchActionOnce(EngineActions.sceneLoaded.matches, () => setupMaterialForFog(entity))
        break

      case FogType.Height:
        scene.fog = new FogExp2(fogComponent.color.getHex(), fogComponent.density)
        initHeightFogShader()
        if (getEngineState().sceneLoaded.value) setupMaterialForFog(entity)
        else matchActionOnce(EngineActions.sceneLoaded.matches, () => setupMaterialForFog(entity))
        break

      default:
        if (scene.fog) {
          scene.fog = null
          removeFogShader()
          restoreMaterialForFog(entity)
        }
        break
    }

  if (!scene.fog) return
  ;(scene.fog as any)._type = fogComponent.type
  scene.fog!.color.set(fogComponent.color)

  if (fogComponent.type === FogType.Linear) {
    ;(scene.fog as Fog).near = fogComponent.near
    ;(scene.fog as Fog).far = fogComponent.far
  } else {
    // For Exponential, Brownian and Hieght fog
    ;(scene.fog as FogExp2).density = fogComponent.density

    if (fogComponent.type !== FogType.Exponential) {
      // For Brownian and Hieght fog
      if (fogComponent.shaders)
        for (const s of fogComponent.shaders) s.uniforms.heightFactor.value = fogComponent.height
    }

    if (fogComponent.type === FogType.Brownian) {
      if (fogComponent.shaders)
        for (const s of fogComponent.shaders) {
          s.uniforms.fogTimeScale.value = fogComponent.timeScale
          s.uniforms.fogTime.value = Engine.instance.currentWorld.fixedElapsedSeconds
        }
    }
  }
}

export const serializeFog: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, FogComponent) as FogComponentType
  return {
    type: component.type,
    color: component.color.getHex(),
    near: component.near,
    far: component.far,
    density: component.density,
    height: component.height,
    timeScale: component.timeScale
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
    if (obj.material.userData?.fogPlugin) {
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

  addEntityNodeChild(fogNode, Engine.instance.currentWorld.entityTree.rootNode)
  updateFog(fogNode.entity)
}
