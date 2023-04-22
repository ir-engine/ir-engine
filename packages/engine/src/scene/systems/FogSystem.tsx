import { Not } from 'bitecs'
import _ from 'lodash'
import React, { useEffect } from 'react'
import { Fog, FogExp2, Mesh, MeshStandardMaterial, Shader } from 'three'

import {
  defineState,
  getMutableState,
  getState,
  hookstate,
  none,
  ReactorProps,
  startReactor,
  State,
  useHookstate
} from '@etherealengine/hyperflux'

import { OBCType } from '../../common/constants/OBCTypes'
import { addOBCPlugin, PluginType, removeOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../../ecs/classes/Engine'
import { SceneMetadata, SceneState } from '../../ecs/classes/Scene'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { createGroupQueryReactor, GroupReactorProps } from '../components/GroupComponent'
import { SceneTagComponent } from '../components/SceneTagComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { FogType } from '../constants/FogType'
import { initBrownianMotionFogShader, initHeightFogShader, removeFogShader } from '../functions/FogShaders'

export const FogShaders = [] as Shader[]

const getFogPlugin = (): PluginType => {
  return {
    id: OBCType.FOG,
    priority: 0,
    compile: (shader) => {
      FogShaders.push(shader)
      shader.uniforms.fogTime = { value: 0.0 }
      shader.uniforms.fogTimeScale = { value: 1 }
      shader.uniforms.heightFactor = { value: getFogSceneMetadataState().height.value }
    }
  }
}

export const DefaultFogState = {
  type: FogType.Linear as FogType,
  color: '#FFFFFF',
  density: 0.005,
  near: 1,
  far: 1000,
  timeScale: 1,
  height: 0.05
}

export type FogState = State<typeof DefaultFogState>

export const FogSceneMetadataLabel = 'fog'

export const FogSettingState = defineState({
  name: 'FogSettingState',
  initial: DefaultFogState
})

export const getFogSceneMetadataState = () => getMutableState(FogSettingState)

function addFogShaderPlugin(obj: Mesh<any, MeshStandardMaterial>) {
  if (!obj.material || !obj.material.fog || obj.material.userData.fogPlugin) return
  obj.material.userData.fogPlugin = getFogPlugin()
  addOBCPlugin(obj.material, obj.material.userData.fogPlugin)
  obj.material.needsUpdate = true
}

function removeFogShaderPlugin(obj: Mesh<any, MeshStandardMaterial>) {
  if (!obj.material?.userData?.fogPlugin) return
  removeOBCPlugin(obj.material, obj.material.userData.fogPlugin)
  delete obj.material.userData.fogPlugin
  // material.needsUpdate is not working. Therefore have to invalidate the cache manually
  const key = Math.random()
  obj.material.customProgramCacheKey = () => key.toString()
  const shader = (obj.material as any).shader // todo add typings somehow
  FogShaders.splice(FogShaders.indexOf(shader), 1)
}

function FogGroupReactor({ obj }: GroupReactorProps) {
  const fog = useHookstate(getFogSceneMetadataState())

  useEffect(() => {
    const customShader = fog.type.value === FogType.Brownian || fog.type.value === FogType.Height
    if (customShader) {
      obj.traverse(addFogShaderPlugin)
      return () => {
        obj.traverse(removeFogShaderPlugin)
      }
    }
  }, [fog.type])

  return null
}

const FogGroupQueryReactor = createGroupQueryReactor(FogGroupReactor, [Not(SceneTagComponent), VisibleComponent])

const reactor = ({ root }: ReactorProps) => {
  const fog = useHookstate(getMutableState(FogSettingState))
  const scene = Engine.instance.scene

  useEffect(() => {
    const fogData = fog.value
    switch (fogData.type) {
      case FogType.Linear:
        scene.fog = new Fog(fogData.color, fogData.near, fogData.far)
        removeFogShader()
        break

      case FogType.Exponential:
        scene.fog = new FogExp2(fogData.color, fogData.density)
        removeFogShader()
        break

      case FogType.Brownian:
        scene.fog = new FogExp2(fogData.color, fogData.density)
        initBrownianMotionFogShader()
        break

      case FogType.Height:
        scene.fog = new FogExp2(fogData.color, fogData.density)
        initHeightFogShader()
        break

      default:
        scene.fog = null
        removeFogShader()
        break
    }
  }, [fog.type])

  useEffect(() => {
    const fogData = fog.value
    if (scene.fog) scene.fog.color.set(fogData.color)
  }, [fog.color])

  useEffect(() => {
    const fogData = fog.value
    if (scene.fog && fogData.type !== FogType.Linear) (scene.fog as FogExp2).density = fogData.density
  }, [fog.density])

  useEffect(() => {
    const fogData = fog.value
    if (scene.fog && fogData.type === FogType.Linear) (scene.fog as Fog).near = fogData.near
  }, [fog.near])

  useEffect(() => {
    const fogData = fog.value
    if (scene.fog && fogData.type === FogType.Linear) (scene.fog as Fog).far = fogData.far
  }, [fog.far])

  useEffect(() => {
    const fogData = fog.value
    if (scene.fog && (fogData.type === FogType.Brownian || fogData.type === FogType.Height))
      for (const s of FogShaders) s.uniforms.heightFactor.value = fogData.height
  }, [fog.timeScale])

  useEffect(() => {
    const fogData = fog.value
    if (scene.fog && fogData.type === FogType.Brownian)
      for (const s of FogShaders) {
        s.uniforms.fogTimeScale.value = fogData.timeScale
        s.uniforms.fogTime.value = Engine.instance.fixedElapsedSeconds
      }
  }, [fog.height])

  useEffect(() => {
    getMutableState(SceneState).sceneMetadataRegistry.merge({
      [FogSceneMetadataLabel]: {
        data: () => getState(FogSettingState),
        dataState: () => getMutableState(FogSettingState),
        default: DefaultFogState
      }
    })
    return () => {
      getMutableState(SceneState).sceneMetadataRegistry[FogSceneMetadataLabel].set(none)
    }
  }, [])
  return <FogGroupQueryReactor root={root} />
}

export const FogSystem = defineSystem({
  uuid: 'ee.engine.FogSystem',
  execute: () => {},
  reactor
})
