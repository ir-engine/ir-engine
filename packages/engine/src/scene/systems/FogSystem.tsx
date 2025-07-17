/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'

import {
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'

import { FogSettingsComponent, FogType } from '@ir-engine/spatial/src/renderer/components/FogSettingsComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { defineMaterialPlugin } from '../../material/defineMaterialPlugin'

export const FogShaderPluginComponent = defineMaterialPlugin({
  name: 'FogShaderPluginComponent',

  jsonID: 'IR_fog_shader',

  uniforms: S.Object({
    fogTime: S.Number(),
    fogTimeScale: S.Number({ default: 1 }),
    heightFactor: S.Number({ default: 0.05 })
  }),

  onApply(shader) {},

  update: (component, deltaSeconds) => {
    component.fogTime += deltaSeconds
  }
})

function FogGroupReactor(props: { fogEntity: Entity }) {
  const entity = useEntityContext()
  const fogSettings = useComponent(props.fogEntity, FogSettingsComponent)

  useEffect(() => {
    setComponent(entity, FogShaderPluginComponent)
    return () => {
      removeComponent(entity, FogShaderPluginComponent)
    }
  }, [])

  useEffect(() => {
    setComponent(entity, FogShaderPluginComponent, { heightFactor: fogSettings.height.value })
  }, [fogSettings.height.value])

  useEffect(() => {
    setComponent(entity, FogShaderPluginComponent, { fogTimeScale: fogSettings.timeScale.value })
  }, [fogSettings.timeScale.value])

  return null
}

const FogReactor = () => {
  const entity = useEntityContext()
  const fogComponent = useComponent(entity, FogSettingsComponent)
  if (fogComponent.type.value !== FogType.Brownian && fogComponent.type.value !== FogType.Height) return null
  return (
    <QueryReactor
      ChildEntityReactor={FogGroupReactor}
      Components={[MaterialStateComponent, VisibleComponent]}
      props={{ fogEntity: entity }}
    />
  )
}

const reactor = () => {
  // TODO support multiple fog entities via spatial queries
  return <QueryReactor ChildEntityReactor={FogReactor} Components={[FogSettingsComponent]} />
}

export const FogSystem = defineSystem({
  uuid: 'ee.engine.FogSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
