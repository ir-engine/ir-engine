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

import { Material } from 'three'

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { stringHash } from '@etherealengine/spatial/src/common/functions/MathFunctions'
import {
  MaterialComponent,
  MaterialPrototypeConstructor,
  MaterialPrototypeObjectConstructor,
  PrototypeArgument
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { extractDefaults } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { SourceComponent } from '../../components/SourceComponent'
import { getModelSceneID } from '../../functions/loaders/ModelFunctions'

export function MaterialNotFoundError(message) {
  this.name = 'MaterialNotFound'
  this.message = message
}

export function PrototypeNotFoundError(message) {
  this.name = 'PrototypeNotFound'
  this.message = message
}

/**Gets all materials used by child and self entity */
export const getMaterialsFromSource = (source: Entity) => {
  const sceneInstanceID = getModelSceneID(source)
  const childEntities = SourceComponent.entitiesBySource[sceneInstanceID] ?? ([] as Entity[])
  childEntities.push(source)
  const materials = {} as Record<EntityUUID, Entity>
  for (const entity of childEntities) {
    if (hasComponent(entity, MaterialComponent)) {
      const materialComponent = getComponent(entity, MaterialComponent)
      for (const mat of materialComponent.uuid) {
        materials[mat] = entity
      }
    }
  }
  return Object.keys(materials) as any as EntityUUID[]
}

/** Creates and uses a new material entity from a GLTF. If a material from the GLTF path already exists in-scene, uses preexisting entity instead. */
export const createMaterialInstance = (path: string, sourceEntity: Entity, material: Material) => {
  //if we already have a material by the same name from the same source, use it instead
  const entityFromHash = MaterialComponent.materialByHash[hashMaterial(path, material.name)]
  if (!hasComponent(sourceEntity, MaterialComponent)) setComponent(sourceEntity, MaterialComponent)
  const materialComponent = getMutableComponent(sourceEntity, MaterialComponent)
  if (entityFromHash) {
    materialComponent.uuid.set([...materialComponent.uuid.value, entityFromHash])
    return entityFromHash
  }
  const newUUID = material.uuid as EntityUUID
  materialComponent.uuid.set([...materialComponent.uuid.value, newUUID])

  if (!UUIDComponent.getEntityByUUID(newUUID)) {
    if (material.plugins) {
      material.customProgramCacheKey = () =>
        material.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
    }
    const materialEntity = createMaterialEntity(material, path)
    const materialEntityComponent = getMutableComponent(materialEntity, MaterialComponent)
    materialEntityComponent.instances.set([...materialEntityComponent.instances.value, sourceEntity])
  }
}

export const createMaterialEntity = (material: Material, path: string) => {
  const materialEntity = createEntity()

  setComponent(materialEntity, MaterialComponent, { material })
  setComponent(materialEntity, UUIDComponent, material.uuid as EntityUUID)
  setComponent(materialEntity, SourceComponent, path)
  const prototypeEntity = MaterialComponent.prototypeByName[material.type]
  setComponent(materialEntity, MaterialComponent, {
    material,
    prototypeEntity,
    parameters: Object.fromEntries(
      Object.keys(extractDefaults(getComponent(prototypeEntity, MaterialComponent).prototypeArguments)).map((k) => [
        k,
        material[k]
      ])
    )
  })
  setMaterialName(materialEntity, material.name)

  return materialEntity
}

/** Removes an instance of a material, also removes its referenced material entity if there are no remaining references to it */
export const removeMaterialInstance = (sourceEntity: Entity, atIndex: number) => {
  const materialComponent = getComponent(sourceEntity, MaterialComponent)
  const materialEntity = UUIDComponent.getEntityByUUID(materialComponent.uuid[atIndex])
  const sourceMaterial = getComponent(materialEntity, MaterialComponent)
  if (!sourceMaterial.instances.length) return
  const instances = sourceMaterial.instances.filter((instance) => instance !== sourceEntity)
  if (instances.length === 0) {
    delete MaterialComponent.materialByName[getComponent(materialEntity, NameComponent)]
    delete MaterialComponent.materialByHash[
      hashMaterial(getComponent(materialEntity, SourceComponent), getComponent(materialEntity, NameComponent))
    ]
    removeEntity(materialEntity)
  }
  return instances.length
}

export const createMaterialFromPrototype = (prototypeName: string, source: string, name: string) => {
  const prototypeEntity = MaterialComponent.prototypeByName[prototypeName]
  const baseMaterial = getComponent(prototypeEntity, MaterialComponent).material
  const newMaterial = {} as Material
  Object.assign(newMaterial, baseMaterial)
  newMaterial.uuid = generateEntityUUID() as string
  createMaterialEntity(newMaterial, source)
}

export const getPrototypeConstructorFromName = (name: string) => {
  const prototypeEntity = MaterialComponent.prototypeByName[name]
  if (!prototypeEntity) return null
  return getComponent(prototypeEntity, MaterialComponent).prototypeConstructor
}

/**Sets a unique name and source hash for a given material entity */
export const setMaterialName = (entity: Entity, name: string) => {
  const materialComponent = getMutableComponent(entity, MaterialComponent)
  if (!materialComponent.material.value) return
  const oldName = getOptionalComponent(entity, NameComponent)
  if (oldName) {
    const oldHash = hashMaterial(getComponent(entity, SourceComponent), oldName)
    const preexistingMaterial = MaterialComponent.materialByHash[oldHash]
    if (preexistingMaterial && preexistingMaterial === getComponent(entity, UUIDComponent)) {
      delete MaterialComponent.materialByHash[oldHash]
      delete MaterialComponent.materialByName[oldName]
    }
  }

  if (MaterialComponent.materialByName[name]) {
    name = uniqueSuffix(name)
  }

  const newHash = hashMaterial(getComponent(entity, SourceComponent), name)
  setComponent(entity, NameComponent, name)
  materialComponent.material.value.name = name
  MaterialComponent.materialByHash[newHash] = getComponent(entity, UUIDComponent)
  MaterialComponent.materialByName[name] = getComponent(entity, UUIDComponent)
}

const uniqueSuffix = (name: string) => {
  let i = 0
  while (MaterialComponent.materialByName[`${name}${i}`]) i++
  return `${name}${i}`
}

export const createPrototype = (
  name: string,
  prototypeArguments: PrototypeArgument,
  prototypeConstructor: MaterialPrototypeConstructor
) => {
  console.log(name, prototypeConstructor)
  const prototypeEntity = createEntity()
  const prototypeObject = {} as MaterialPrototypeObjectConstructor
  prototypeObject[name] = prototypeConstructor
  setComponent(prototypeEntity, MaterialComponent, {
    prototypeConstructor: prototypeObject,
    prototypeArguments
  })
  setComponent(prototypeEntity, NameComponent, name)
  setComponent(prototypeEntity, UUIDComponent, generateEntityUUID())
  /**@todo handle duplicate prototype names */
  if (MaterialComponent.prototypeByName[name]) throw new Error('Prototype already exists')
  MaterialComponent.prototypeByName[name] = prototypeEntity
}

// export function registerMaterialPlugin(component: MaterialPluginType) {
//   const materialLibrary = getMutableState(MaterialLibraryState)
//   const src = component.src
//   addMaterialSource(src)
//   const srcItems = getSourceItems(src)!
//   !srcItems.includes(component.plugin.id) &&
//     materialLibrary.sources[hashMaterialSource(component.src)].entries.set([...srcItems, component.plugin.id])
//   materialLibrary.plugins[component.plugin.id].set(component)
// }

export const injectMaterialDefaults = (materialUUID: string) => {
  const material = getComponent(UUIDComponent.getEntityByUUID(materialUUID as EntityUUID), MaterialComponent)
  const prototype = getComponent(material.prototypeEntity, MaterialComponent).prototypeArguments
  return Object.fromEntries(
    Object.entries(prototype).map(([k, v]: [string, any]) => [k, { ...v, default: material.parameters[k] }])
  )
}

export const hashMaterial = (source: string, name: string) => {
  return `${stringHash(source) ^ stringHash(name)}`
}

export const setMaterialPrototype = (materialEntity: Entity, prototypeName: string) => {
  const materialComponent = getComponent(materialEntity, MaterialComponent)
  const prototype = MaterialComponent.prototypeByName[prototypeName]
  const prototypeComponent = getComponent(prototype, MaterialComponent)
  const prototypeConstructor = prototypeComponent.prototypeConstructor![prototypeName]
  if (materialComponent.prototypeEntity === prototype || !prototypeConstructor) return
  const material = materialComponent.material!
  const matKeys = Object.keys(material)
  const commonParms = Object.fromEntries(
    Object.keys(prototypeComponent.prototypeArguments)
      .filter((key) => matKeys.includes(key))
      .map((key) => [key, material[key]])
  )
  const fullParameters = { ...extractDefaults(prototypeComponent.prototypeArguments), ...commonParms }
  const nuMat = new prototypeConstructor(fullParameters)
  if (nuMat.plugins) {
    nuMat.customProgramCacheKey = () => nuMat.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
  }
  nuMat.uuid = material.uuid
  nuMat.name = material.name
  if (material.defines?.['USE_COLOR']) {
    nuMat.defines = nuMat.defines ?? {}
    nuMat.defines!['USE_COLOR'] = material.defines!['USE_COLOR']
  }
  nuMat.userData = {
    ...nuMat.userData,
    ...Object.fromEntries(Object.entries(material.userData).filter(([k, v]) => k !== 'type'))
  }
  setComponent(materialEntity, MaterialComponent, {
    material: nuMat,
    prototypeEntity: prototype,
    parameters: fullParameters
  })
  return nuMat
}
