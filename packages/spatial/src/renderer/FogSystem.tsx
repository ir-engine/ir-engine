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

import React, { useEffect } from 'react'
import { Mesh, MeshStandardMaterial, Shader } from 'three'

import { Entity, PresentationSystemGroup, QueryReactor, useComponent, useEntityContext } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getState } from '@etherealengine/hyperflux'
import {
  PluginType,
  addOBCPlugin,
  removeOBCPlugin
} from '@etherealengine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'

import { FogSettingsComponent, FogType } from './components/FogSettingsComponent'

export const FogShaders = [] as Shader[]

const getFogPlugin = (): PluginType => {
  return {
    id: 'ee.engine.FogPlugin',
    priority: 0,
    compile: (shader) => {
      FogShaders.push(shader)
      shader.uniforms.fogTime = { value: 0.0 }
      shader.uniforms.fogTimeScale = { value: 1 }
      shader.uniforms.heightFactor = { value: 0.05 }
    }
  }
}

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
  obj.material.needsUpdate = true
  const shader = (obj.material as any).shader // todo add typings somehow
  FogShaders.splice(FogShaders.indexOf(shader), 1)
}

function FogGroupReactor(props: { fogEntity: Entity }) {
  const entity = useEntityContext()
  const fogComponent = useComponent(props.fogEntity, FogSettingsComponent)
  const group = useComponent(entity, GroupComponent)

  useEffect(() => {
    const customShader = fogComponent.type.value === FogType.Brownian || fogComponent.type.value === FogType.Height
    if (customShader) {
      const objs = [...group]
      for (const obj of objs) addFogShaderPlugin(obj as any)
      return () => {
        for (const obj of objs) removeFogShaderPlugin(obj as any)
      }
    }
  }, [fogComponent.type, group])

  return null
}

const FogReactor = () => {
  const entity = useEntityContext()
  return (
    <QueryReactor
      ChildEntityReactor={FogGroupReactor}
      Components={[GroupComponent, VisibleComponent]}
      props={{ fogEntity: entity }}
    />
  )
}

const reactor = () => {
  // TODO support multiple fog entities via spatial queries
  return <QueryReactor ChildEntityReactor={FogReactor} Components={[FogSettingsComponent]} />
}

const execute = () => {
  for (const s of FogShaders) {
    if (s.uniforms.fogTime) s.uniforms.fogTime.value = getState(ECSState).elapsedSeconds
  }
}

export const FogSystem = defineSystem({
  uuid: 'ee.engine.FogSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
