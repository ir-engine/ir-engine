import { Color, Fog, FogExp2, Mesh, MeshStandardMaterial } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { BeforeCompilePluginType, PluginType } from '../../../common/functions/MaterialPlugin'
import { Engine } from '../../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, getComponentCountOfType } from '../../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../../networking/functions/matchActionOnce'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { FogComponent, FogComponentType } from '../../components/FogComponent'
import { FogType } from '../../constants/FogType'
import { initBrownianMotionFogShader, removeFogShader } from '../FogShaders'

export const SCENE_COMPONENT_FOG = 'fog'
export const SCENE_COMPONENT_FOG_DEFAULT_VALUES = {
  type: FogType.Linear,
  color: '#FFFFFF',
  density: 0.000025,
  near: 1,
  far: 1000,
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
        break

      case FogType.Exponential:
      case FogType.Brownian:
        scene.fog = new FogExp2(component.color.getHexString(), component.density)
        break

      default:
        scene.fog = null
        break
    }

    if (component.type === FogType.Brownian) {
      initBrownianMotionFogShader()
      if (getEngineState().sceneLoaded.value) setupMaterialForFog(entity)
      else matchActionOnce(EngineActions.sceneLoaded.matches, () => setupMaterialForFog(entity))
    } else {
      removeFogShader()
      restoreMaterialForFog(entity)
    }
  }

  if (scene.fog) {
    if (typeof properties.color !== 'undefined') scene.fog.color.set(component.color)

    if (component.type === FogType.Linear) {
      if (typeof properties.near !== 'undefined') (scene.fog as Fog).near = component.near
      if (typeof properties.far !== 'undefined') (scene.fog as Fog).far = component.far
    } else {
      if (typeof properties.density !== 'undefined') (scene.fog as FogExp2).density = component.density

      if (component.type !== FogType.Exponential) {
        if (typeof properties.height !== 'undefined') {
          // component.shaders?.forEach(s => {
          //   s.uniforms.heightFactor.value = component.height
          // })
        }
      }
      // if (component.type === FogType.Brownian) {

      // }
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
      height: component.height
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
    height: props.height ?? SCENE_COMPONENT_FOG_DEFAULT_VALUES.height
  }
}

export const shouldDeserializeFog: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(FogComponent) <= 0
}

const setupMaterialForFog = (entity: Entity) => {
  const component = getComponent(entity, FogComponent)
  component.shaders = []

  Engine.instance.currentWorld.scene.traverse((obj: Mesh<any, MeshStandardMaterial>) => {
    if (typeof obj.material == 'undefined') return
    obj.material.userData.fogPlugin = getFogPlugin(component)
    console.debug('Hey', obj.material.userData.fogPlugin)
    obj.material.onBeforeCompile = obj.material.userData.fogPlugin
  })
}

const restoreMaterialForFog = (entity: Entity) => {
  const component = getComponent(entity, FogComponent)
  component.shaders = []

  Engine.instance.currentWorld.scene.traverse((obj: Mesh<any, MeshStandardMaterial>) => {
    if (typeof obj.material == 'undefined' || !obj.material.userData.fogPlugin) return
    obj.material.removePlugin(obj.material.userData.fogPlugin)
  })
}

const getFogPlugin = (component: FogComponentType): BeforeCompilePluginType => {
  return {
    frame: function () {},
    render: (_obj, shader) => {
      // console.debug('rendering.....', shader)
      shader.uniforms.fogTime = { value: Engine.instance.currentWorld.fixedElapsedSeconds }
      shader.uniforms.heightFactor = { value: component.height }
    },
    compile: (s, r) => {
      // console.debug('compiling.')
      // s.uniforms.fogTime = { value: 0.0 }
      // s.uniforms.heightFactor = { value: component.height }
    }
  }
}
