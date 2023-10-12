/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Not } from 'bitecs'
import React, { useEffect } from 'react'
import { Fog, FogExp2, Mesh, MeshStandardMaterial, Shader } from 'three'

import { defineState, getMutableState, getState, State, useHookstate } from '@etherealengine/hyperflux'

import { OBCType } from '../../common/constants/OBCTypes'
import { addOBCPlugin, PluginType, removeOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { GroupQueryReactor, GroupReactorProps } from '../components/GroupComponent'
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
      shader.uniforms.heightFactor = { value: getState(FogSettingState).height }
    }
  }
}

export const DefaultFogState = {
  type: FogType.Disabled as FogType,
  color: '#FFFFFF',
  density: 0.005,
  near: 1,
  far: 1000,
  timeScale: 1,
  height: 0.05
}

export type FogState = State<typeof DefaultFogState>

export const FogSettingState = defineState({
  name: 'FogSettingState',
  initial: DefaultFogState
})

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
  const fog = useHookstate(getMutableState(FogSettingState))

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

const reactor = () => {
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
        s.uniforms.fogTime.value = getState(EngineState).elapsedSeconds
      }
  }, [fog.height])

  return (
    <GroupQueryReactor GroupChildReactor={FogGroupReactor} Components={[Not(SceneTagComponent), VisibleComponent]} />
  )
}

export const FogSystem = defineSystem({
  uuid: 'ee.engine.FogSystem',
  execute: () => {},
  reactor
})
