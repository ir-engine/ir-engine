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

import { isArray } from 'lodash'
import { Color, Material, Mesh, Texture } from 'three'

import {
  createEntity,
  Entity,
  EntityUUID,
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  getOptionalMutableComponent,
  hasComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'

import { AssetLoaderState } from '@ir-engine/engine/src/assets/state/AssetLoaderState'
import { getState } from '@ir-engine/hyperflux'
import iterateObject3D from '../../common/functions/iterateObject3D'
import { NameComponent } from '../../common/NameComponent'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialInstanceComponent,
  MaterialPlugins,
  MaterialPrototypeComponent,
  MaterialPrototypeDefinition,
  MaterialPrototypeObjectConstructor,
  MaterialStateComponent,
  PrototypeArgument,
  prototypeQuery
} from './MaterialComponent'

export const loadMaterialGLTF = (url: string, callback: (material: Material | null) => void) => {
  const gltfLoader = getState(AssetLoaderState).gltfLoader
  gltfLoader.load(url, (gltf) => {
    const material = iterateObject3D(
      gltf.scene,
      (mesh: Mesh) => mesh.material as Material,
      (mesh: Mesh) => mesh?.isMesh
    )[0]
    if (!material) callback(null)
    callback(material)
  })
}

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

export const createMaterialPrototype = (prototype: MaterialPrototypeDefinition) => {
  const prototypeEntity = createEntity()
  const prototypeObject = {} as MaterialPrototypeObjectConstructor
  prototypeObject[prototype.prototypeId] = prototype.prototypeConstructor
  setComponent(prototypeEntity, MaterialPrototypeComponent, {
    prototypeConstructor: prototypeObject,
    prototypeArguments: prototype.arguments
  })
  setComponent(prototypeEntity, NameComponent, prototype.prototypeId)
  setComponent(prototypeEntity, UUIDComponent, generateEntityUUID())
}

export const getMaterial = (uuid: EntityUUID) => {
  return (
    getOptionalComponent(UUIDComponent.getEntityByUUID(uuid), MaterialStateComponent)?.material ??
    getComponent(UUIDComponent.getEntityByUUID(MaterialStateComponent.fallbackMaterial), MaterialStateComponent)
      .material
  )
}

export const setMeshMaterial = (groupEntity: Entity, newMaterialUUIDs: EntityUUID[]) => {
  if (!groupEntity) return
  if (!hasComponent(groupEntity, MeshComponent)) return
  if (newMaterialUUIDs.length === 0) return

  const mesh = getComponent(groupEntity, MeshComponent) as Mesh
  if (!isArray(mesh.material)) mesh.material = getMaterial(newMaterialUUIDs[0])
  else
    for (let i = 0; i < (mesh.material as Material[]).length; i++) mesh.material[i] = getMaterial(newMaterialUUIDs[i])
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
  if (pluginIndex !== undefined) material.plugins?.splice(pluginIndex, 1)
}

export const materialPrototypeMatches = (materialEntity: Entity) => {
  const materialComponent = getOptionalComponent(materialEntity, MaterialStateComponent)
  if (!materialComponent) return false
  const prototypeEntity = materialComponent.prototypeEntity
  if (!prototypeEntity) return false
  const prototypeComponent = getOptionalComponent(prototypeEntity, MaterialPrototypeComponent)
  if (!prototypeComponent) return false
  if (!prototypeComponent.prototypeConstructor) return false
  const prototypeName = Object.keys(prototypeComponent.prototypeConstructor)[0]
  const material = materialComponent.material
  const materialType = material.userData.type || material.type
  return materialType === prototypeName
}

/**Updates the material entity's threejs material prototype to match its
 * current prototype entity */
export const updateMaterialPrototype = (materialEntity: Entity) => {
  const materialComponent = getOptionalComponent(materialEntity, MaterialStateComponent)
  if (!materialComponent) return
  const prototypeEntity = materialComponent.prototypeEntity
  if (!prototypeEntity) return
  const prototypeName = getOptionalComponent(prototypeEntity, NameComponent)
  if (!prototypeName) return
  const prototypeComponent = getOptionalComponent(prototypeEntity, MaterialPrototypeComponent)
  if (!prototypeComponent) return
  const prototypeConstructor = prototypeComponent.prototypeConstructor[prototypeName]
  const material = materialComponent.material
  if (!material || material.type === prototypeName) return
  const fullParameters = { ...extractDefaults(prototypeComponent.prototypeArguments) }
  if (!prototypeConstructor) return
  const newMaterial = new prototypeConstructor(fullParameters) as Material
  if (newMaterial.plugins) {
    newMaterial.customProgramCacheKey = () =>
      (newMaterial.shader ? newMaterial.shader.fragmentShader + newMaterial.shader.vertexShader : '') +
      newMaterial.plugins!.map((plugin) => plugin?.toString() ?? '').reduce((x, y) => x + y, '')
  }
  newMaterial.uuid = material.uuid
  if (material.defines?.['USE_COLOR']) {
    newMaterial.defines = newMaterial.defines ?? {}
    newMaterial.defines!['USE_COLOR'] = material.defines!['USE_COLOR']
  }
  if (material.userData) {
    newMaterial.userData = {
      ...newMaterial.userData,
      ...Object.fromEntries(Object.entries(material.userData).filter(([k, _v]) => k !== 'type'))
    }
  }
  setComponent(materialEntity, MaterialStateComponent, {
    material: newMaterial,
    parameters: fullParameters
  })

  return newMaterial
}

export function MaterialNotFoundError(message: string) {
  this.name = 'MaterialNotFound'
  this.message = message
}

export function PrototypeNotFoundError(message: string) {
  this.name = 'PrototypeNotFound'
  this.message = message
}

/** Assigns a preexisting material entity to a mesh */
export const assignMaterial = (user: Entity, materialEntity: Entity, index = 0) => {
  const materialStateComponent = getOptionalMutableComponent(materialEntity, MaterialStateComponent)
  if (!materialStateComponent) return
  materialStateComponent.instances.set([...materialStateComponent.instances.value, user])
  if (!user) return
  if (!hasComponent(user, MaterialInstanceComponent)) setComponent(user, MaterialInstanceComponent)
  const material = materialStateComponent.material.value as Material
  const materialInstanceComponent = getMutableComponent(user, MaterialInstanceComponent)
  const newUUID = material.uuid as EntityUUID
  if (!UUIDComponent.getEntityByUUID(newUUID)) throw new MaterialNotFoundError(`Material ${newUUID} not found`)
  materialInstanceComponent.uuid[index].set(newUUID)
}

/**Sets and replaces a material entity for a material's UUID */
export const createMaterialEntity = (material: Material): Entity => {
  const materialEntity = createEntity()
  const uuid = material.uuid as EntityUUID
  const existingMaterial = UUIDComponent.getEntityByUUID(uuid)
  const existingUsers = existingMaterial ? getComponent(existingMaterial, MaterialStateComponent).instances : []
  if (existingMaterial) {
    removeEntity(existingMaterial)
  }
  setComponent(materialEntity, UUIDComponent, material.uuid as EntityUUID)
  const prototypeEntity = getPrototypeEntityFromName(material.userData.type || material.type)
  if (!prototypeEntity) {
    console.warn(
      `Material ${material.name} has no prototype entity for prototype ${material.userData.type || material.type}`
    )
    return UndefinedEntity
  }
  setComponent(materialEntity, MaterialStateComponent, {
    material,
    prototypeEntity,
    parameters: Object.fromEntries(
      Object.keys(extractDefaults(getComponent(prototypeEntity, MaterialPrototypeComponent).prototypeArguments)).map(
        (k) => [k, material[k]]
      )
    ),
    instances: existingUsers.length ? existingUsers : []
  })
  if (existingMaterial)
    for (const instance of existingUsers)
      setMeshMaterial(instance, getComponent(instance, MaterialInstanceComponent).uuid)
  if (material.userData?.plugins)
    material.userData.plugins.map((plugin) => {
      if (!plugin) return
      setComponent(materialEntity, MaterialPlugins[plugin.id])
      const pluginComponent = getComponent(materialEntity, MaterialPlugins[plugin.id])
      for (const [k, v] of Object.entries(plugin.uniforms)) {
        if (v) pluginComponent[k].value = v
      }
    })
  setComponent(materialEntity, NameComponent, material.name === '' ? material.type : material.name)
  return materialEntity
}

export const createAndAssignMaterial = (user: Entity, material: Material, index = 0) => {
  const materialEntity = createMaterialEntity(material)
  assignMaterial(user, materialEntity, index)
  return materialEntity
}

export const getMaterialIndices = (entity: Entity, materialUUID: EntityUUID): number[] => {
  if (!hasComponent(entity, MaterialInstanceComponent)) return [] as number[]
  const uuids = getComponent(entity, MaterialInstanceComponent).uuid
  return uuids
    .map((uuid, index) => (uuid === materialUUID ? index : undefined))
    .filter((x) => x !== undefined) as number[]
}

export const getPrototypeEntityFromName = (name: string) =>
  prototypeQuery().find((entity) => getOptionalComponent(entity, NameComponent) === name)

export const injectMaterialDefaults = (materialUUID: EntityUUID) => {
  const material = getOptionalComponent(UUIDComponent.getEntityByUUID(materialUUID), MaterialStateComponent)
  if (!material?.prototypeEntity) return
  const prototype = getComponent(material.prototypeEntity, MaterialPrototypeComponent).prototypeArguments
  if (!prototype) return
  return Object.fromEntries(
    Object.entries(prototype).map(([k, v]: [string, any]) => [k, { ...v, default: material.parameters![k] }])
  )
}
