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

import { defineComponent, Entity, getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect } from 'react'
import { Material, Vector2 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { getRendererEntity } from '../functions/useRendererEntity'
import { MaterialStateComponent } from '../materials/MaterialComponent'
import { removePlugin, setPlugin } from '../materials/materialFunctions'
import { CSM } from './CSM'
import { CSMComponent } from './CSMComponent'

export const CSMPluginComponent = defineComponent({
  name: 'CSMPluginComponent',

  schema: S.Object({}),

  reactor: (props: { entity: Entity }) => {
    const entity = props.entity
    useEffect(() => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
      if (!materialComponent) return

      const material = materialComponent.material
      if (!material?.isMaterial) return

      const rendererEntity = getRendererEntity(entity)
      const csm = getOptionalComponent(rendererEntity, CSMComponent)
      if (!csm) return

      material.defines = material.defines || {}
      material.defines.USE_CSM = 1
      material.defines.CSM_CASCADES = csm.cascades

      if (csm.fade) {
        material.defines.CSM_FADE = ''
      }

      const breaksVec2: Vector2[] = []

      const callback = (shader: any) => {
        const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
        const far = Math.min(camera.far, csm.maxFar)
        const near = Math.min(csm.maxFar, camera.near)
        CSM.getExtendedBreaks(breaksVec2, rendererEntity)

        shader.uniforms.CSM_cascades = { value: breaksVec2 }
        shader.uniforms.cameraNear = { value: near }
        shader.uniforms.shadowFar = { value: far }
      }

      setPlugin(materialComponent.material as Material, callback)
      material.needsUpdate = true
      return () => {
        removePlugin(materialComponent.material as Material, callback)

        if (material.defines) {
          delete material.defines.USE_CSM
          delete material.defines.CSM_CASCADES
          delete material.defines.CSM_FADE
        }

        material.needsUpdate = true
      }
    }, [])

    return null
  }
})
