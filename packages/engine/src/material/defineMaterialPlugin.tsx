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

import {
  defineComponent,
  ECSState,
  Entity,
  getComponent,
  PresentationSystemGroup,
  S,
  Schema,
  Static,
  useComponent
} from '@ir-engine/ecs'
import { SystemUUID, useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { getState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import {
  MaterialPluginComponents,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { removePlugin, setPlugin } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import React, { useEffect } from 'react'
import { Color, Material, Shader, Texture, Uniform, Vector2, Vector3, Vector4, WebGLRenderer } from 'three'
import { useTexture } from '../assets/functions/resourceLoaderHooks'

/**
 * A JSON Schema for a texture uniform.
 * - `string` for remote textures
 * - `null` for no texture
 */
export const TextureSchema = () =>
  S.Union([S.String(), S.Null(), S.Type<Texture>()], { default: null, metadata: { $isTexture: true } })

const isTextureUniform = (uniformSchema: Schema) => !!uniformSchema.options?.metadata?.$isTexture

/**
 *
 * @usage
 * const MyPlugin = defineMaterialPlugin({
 *   name: 'MyPlugin',
 *
 *   jsonID: 'IR_material_custom',
 *
 *   uniforms: {
 *     time: 0,
 *     enabled: true
 *   },
 *
 *   onApply: (shader, renderer, uniforms) => {
 *     shader.fragmentShader = shader.fragmentShader.replace(
 *       'void main() {',
 *       `
 *         uniform float time;
 *         uniform bool enabled;
 *
 *         void main() {
 *       `
 *     )
 *       shader.uniforms.time.value = uniforms.time
 *       shader.uniforms.boolean.value = uniforms.boolean
 *   },
 *
 *   update: (deltaSeconds, uniforms) => {
 *     uniforms.float.value += deltaSeconds
 *   }
 * })
 **/

export type ValidUniformTypes = boolean | number | string | Vector2 | Vector3 | Vector4 | Color | Texture

export type UniformRecord = Record<string, ValidUniformTypes>

export const defineMaterialPlugin = <T extends Schema>({
  name,
  jsonID,
  uniforms: uniformSchema,
  onApply,
  update,
  reactor: Reactor
}: {
  name: string
  jsonID: string
  uniforms: T
  onApply: (shader: Shader, renderer: WebGLRenderer) => void
  update?: (component: Static<T>, deltaSeconds: number) => void
  reactor?: any
}) => {
  const PluginComponent = defineComponent({
    name,

    jsonID,

    schema: uniformSchema,

    reactor: ({ entity }) => {
      /** Suspend context until material exists */
      const material = useComponent(entity, MaterialStateComponent).material.value as Material

      const pluginState = useComponent(entity, PluginComponent).get(NO_PROXY) as UniformRecord

      const textureUniforms = Object.fromEntries(
        Object.entries(uniformSchema.properties!)
          .filter(([key, value]) => isTextureUniform(value))
          .map(([key, value]) => [key, new Uniform(null)])
      ) as Record<keyof UniformRecord, Uniform<Texture | null>>

      const uniforms = useHookstate(
        () =>
          Object.fromEntries(
            Object.entries(pluginState).map(([key, value]) => {
              if (isTextureUniform(uniformSchema.properties![key])) return [key, new Uniform(null)]
              return [key, new Uniform(value !== null && typeof value === 'object' && 'index' in value ? null : value)]
            })
          ) as Record<keyof UniformRecord, Uniform>
      ).get(NO_PROXY) as Record<keyof UniformRecord, Uniform>

      for (const key in textureUniforms) {
        const src = pluginState[key]
        const [texture] = useTexture(typeof src === 'string' ? src : '', entity)
        textureUniforms[key].value = texture
      }

      useEffect(() => {
        const callback = (shader: Shader, renderer: WebGLRenderer) => {
          for (const key in uniforms) {
            shader.uniforms[key] = uniforms[key]
          }

          onApply(shader, renderer)
        }
        setPlugin(material, callback)
        return () => {
          removePlugin(material, callback)
        }
      }, [material])

      useExecute(
        () => {
          const uniformValues = getComponent(entity, PluginComponent)
          if (update) update(uniformValues, getState(ECSState).deltaSeconds)
          for (const key in uniforms) {
            uniforms[key].value = key in textureUniforms ? textureUniforms[key].value : uniformValues[key]
          }
        },
        { before: PresentationSystemGroup, uuid: makeMaterialPluginUpdateSystemID(name, entity) }
      )

      return Reactor ? <Reactor entity={entity} /> : null
    }
  })

  MaterialPluginComponents[name] = PluginComponent

  return PluginComponent
}

export const makeMaterialPluginUpdateSystemID = (pluginName: string, entity: Entity) =>
  (pluginName + 'MaterialPluginUpdateSystem' + entity) as SystemUUID
