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

import { Color, Material, Mesh, Texture } from 'three'

import {
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'

import { getState } from '@ir-engine/hyperflux'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPrototypeDefinitions,
  MaterialStateComponent,
  PrototypeArgument
} from './MaterialComponent'

export const extractDefaults = (defaultArgs: PrototypeArgument) => {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, v.default])),
    defaultArgs
  )
}

export const extractValues = (defaultArgs: PrototypeArgument, material: Material) => {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, material[k]])),
    defaultArgs
  )
}

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

export const setMeshMaterial = (groupEntity: Entity, newMaterialUUIDs: EntityUUID[]) => {
  if (!groupEntity) return
  if (!hasComponent(groupEntity, MeshComponent)) return
  if (newMaterialUUIDs.length === 0) return

  const mesh = getComponent(groupEntity, MeshComponent) as Mesh
  if (!Array.isArray(mesh.material))
    mesh.material = getComponent(
      UUIDComponent.getEntityByUUID(newMaterialUUIDs[0]) ?? MaterialStateComponent.fallbackMaterialUUID,
      MaterialStateComponent
    ).material
  else
    for (let i = 0; i < (mesh.material as Material[]).length; i++)
      mesh.material[i] = getComponent(
        UUIDComponent.getEntityByUUID(newMaterialUUIDs[i]) ?? MaterialStateComponent.fallbackMaterialUUID,
        MaterialStateComponent
      ).material
}

export const setPlugin = (material: Material, callback) => {
  if (hasPlugin(material, callback)) removePlugin(material, callback)
  material.onBeforeCompile = callback
  material.needsUpdate = true // @warning This is actually a setter (with no getter) that calls ++material.version
}

export const hasPlugin = (material: Material, callback) =>
  Boolean(material.plugins?.length && !!material.plugins.find((plugin) => plugin.toString() === callback.toString()))

export const removePlugin = (material: Material, callback) => {
  const pluginIndex = material.plugins?.findIndex((plugin) => plugin === callback)
  if (pluginIndex !== undefined && pluginIndex >= 0) material.plugins?.splice(pluginIndex, 1)
}

export function MaterialNotFoundError(message: string) {
  this.name = 'MaterialNotFound'
  this.message = message
}

export function PrototypeNotFoundError(message: string) {
  this.name = 'PrototypeNotFound'
  this.message = message
}

export const getMaterialIndices = (entity: Entity, materialUUID: EntityUUID): number[] => {
  if (!hasComponent(entity, MaterialInstanceComponent)) return [] as number[]
  const uuids = getComponent(entity, MaterialInstanceComponent).uuid
  return uuids
    .map((uuid, index) => (uuid === materialUUID ? index : undefined))
    .filter((x) => x !== undefined) as number[]
}

export const injectMaterialDefaults = (materialUUID: EntityUUID) => {
  const material = getOptionalComponent(UUIDComponent.getEntityByUUID(materialUUID), MaterialStateComponent)
  if (!material) return
  const prototype = getState(MaterialPrototypeDefinitions)[material.material.type].arguments
  if (!prototype) return
  return Object.fromEntries(
    Object.entries(prototype).map(([k, v]: [string, any]) => [k, { ...v, default: material.parameters![k] }])
  )
}

/**sets up parameters for editing and serialization into a scene delta */
export const setupMaterialParameters = (entity: Entity, properties: { [_: string]: any }) => {
  const params = {} as any
  Object.entries(properties).map(([k, v]) => {
    if (!properties[k]) return
    if (v.isTexture) {
      const url = v.userData?.url
      if (url) params[k] = url
    } else if (v.isColor) {
      params[k] = (v as Color).getHex()
    } else {
      params[k] = v
    }
  })

  setComponent(entity, MaterialStateComponent, { parameters: params })
  return params
}
