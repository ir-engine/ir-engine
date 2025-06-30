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

import { Color, Material, Mesh, Shader, Texture } from 'three'

import { Entity, getComponent, getMutableComponent, hasComponent } from '@ir-engine/ecs'

import { getState } from '@ir-engine/hyperflux'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeDefinitions,
  MaterialStateComponent,
  PrototypeArgument,
  SerializedTexture
} from './MaterialComponent'

export const formatMaterialArgs = (args: any, defaultArgs?: PrototypeArgument) => {
  if (!args) return args
  return Object.fromEntries(
    Object.entries(args)
      .map(([k, v]: [string, any]) => {
        if (!!defaultArgs && defaultArgs[k]) {
          switch (defaultArgs[k].type) {
            case 'color':
              return [k, v ? ((v as Color).isColor ? v : new Color(v)) : undefined]
          }
        }
        const tex = v as Texture
        if (tex?.isTexture) return [k, tex.source.data !== undefined ? v : undefined]
        if (v === '') return [k, undefined]
        return [k, v]
      })
      .filter(([_, v]) => v !== undefined)
  )
}

export const setMeshMaterial = (groupEntity: Entity, newMaterialEntities: Entity[]) => {
  if (!groupEntity) return
  if (!hasComponent(groupEntity, MeshComponent)) return
  if (newMaterialEntities.length === 0) return

  const mesh = getComponent(groupEntity, MeshComponent) as Mesh
  const fallbackMaterial = MaterialStateComponent.fallbackMaterial()
  if (!Array.isArray(mesh.material)) {
    const materialEntity = newMaterialEntities[0] ?? fallbackMaterial
    if (!materialEntity || !hasComponent(materialEntity, MaterialStateComponent)) return
    mesh.material = getComponent(materialEntity, MaterialStateComponent).material
  } else {
    for (let i = 0; i < (mesh.material as Material[]).length; i++) {
      const materialEntity = newMaterialEntities[i] ?? fallbackMaterial
      if (!materialEntity || !hasComponent(materialEntity, MaterialStateComponent)) continue
      mesh.material[i] = getComponent(materialEntity, MaterialStateComponent).material
    }
  }
}

type MaterialCallback = (shader: Shader, renderer: any) => void

export const setPlugin = (material: Material, callback: MaterialCallback) => {
  if (hasPlugin(material, callback)) removePlugin(material, callback)
  material.onBeforeCompile = callback
  material.needsUpdate = true // @warning This is actually a setter (with no getter) that calls ++material.version
}

export const hasPlugin = (material: Material, callback: MaterialCallback) =>
  Boolean(material.plugins?.length && !!material.plugins.find((plugin) => plugin.toString() === callback.toString()))

export const removePlugin = (material: Material, callback: MaterialCallback) => {
  const pluginIndex = material.plugins?.findIndex((plugin) => plugin === callback)
  if (pluginIndex !== undefined && pluginIndex >= 0) material.plugins?.splice(pluginIndex, 1)
}

export const getMaterialIndices = (entity: Entity, materialEntity: Entity): number[] => {
  if (!hasComponent(entity, MaterialInstanceComponent)) return [] as number[]
  const materialEntities = getComponent(entity, MaterialInstanceComponent).entities
  return materialEntities
    .map((currentEntity, index) => (currentEntity === materialEntity ? index : undefined))
    .filter((x) => x !== undefined) as number[]
}

export const setupMaterialParameters = (entity: Entity, type: string, properties: { [_: string]: any }) => {
  const params = {} as Record<string, any>
  Object.entries(properties).map(([k, v]) => {
    if (!properties[k]) return
    if (typeof v === 'function') return
    if (v.isTexture) {
      const url = v.userData?.url ?? v.userData?.src
      if (url) params[k] = { source: url, channel: v.channel, repeat: v.repeat, offset: v.offset } as SerializedTexture
      return
    }
    if (v.isColor) {
      params[k] = new Color(v).getHex()
      return
    }
    if (typeof v === 'object') return
    params[k] = v
  })
  getMutableComponent(entity, MaterialStateComponent).parameters.merge(params)
  return params
}

export const getMaterialParameterDefaults = (type: string) => {
  const prototype = getState(MaterialPrototypeDefinitions)[type]
  return Object.fromEntries(Object.entries(prototype.arguments).map(([k, v]) => [k, v.default]))
}

export const getMaterialParameterKeys = (type: string) => {
  const prototype = getState(MaterialPrototypeDefinitions)[type]
  if (!prototype) return []
  return Object.keys(prototype.arguments)
}
