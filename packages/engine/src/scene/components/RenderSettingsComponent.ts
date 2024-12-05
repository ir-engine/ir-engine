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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  CustomToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap
} from 'three'

import { defineComponent, getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

const ToneMappingSchema = S.LiteralUnion(
  [NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, CustomToneMapping],
  LinearToneMapping
)

const ShadowMapSchema = S.LiteralUnion([BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap], PCFSoftShadowMap)

export const RenderSettingsComponent = defineComponent({
  name: 'RenderSettingsComponent',
  jsonID: 'EE_render_settings',

  schema: S.Object({
    primaryLight: T.EntityUUID(),
    csm: S.Bool(true),
    cascades: S.Number(5),
    toneMapping: ToneMappingSchema,
    toneMappingExposure: S.Number(0.8),
    shadowMapType: ShadowMapSchema
  }),

  reactor: () => {
    const entity = useEntityContext()
    const rendererEntity = useRendererEntity(entity)
    const component = useComponent(entity, RenderSettingsComponent)

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.toneMapping = component.toneMapping.value
    }, [component.toneMapping])

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.toneMappingExposure = component.toneMappingExposure.value
    }, [component.toneMappingExposure])

    useEffect(() => {
      if (!rendererEntity) return
      const renderer = getComponent(rendererEntity, RendererComponent).renderer!
      renderer.shadowMap.type = component.shadowMapType.value
      renderer.shadowMap.needsUpdate = true
    }, [component.shadowMapType])

    return null
  }
})
