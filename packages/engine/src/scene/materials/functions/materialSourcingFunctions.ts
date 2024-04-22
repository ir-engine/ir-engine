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

import { getState } from '@etherealengine/hyperflux'

import { SceneID } from '@etherealengine/common/src/schema.type.module'
import {
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  defineQuery,
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
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import {
  MaterialComponent,
  PrototypeArgument,
  materialSuffix
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { extractDefaults } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { SourceComponent } from '../../components/SourceComponent'
import { MaterialLibraryState } from '../MaterialLibrary'

export function MaterialNotFoundError(message) {
  this.name = 'MaterialNotFound'
  this.message = message
}

export function PrototypeNotFoundError(message) {
  this.name = 'PrototypeNotFound'
  this.message = message
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
    createMaterialEntity(material, path)
  }
  materialComponent.instances.set([...materialComponent.instances.value, sourceEntity])
}

export const createMaterialEntity = (material: Material, path: string) => {
  const materialEntity = createEntity()

  setComponent(materialEntity, MaterialComponent, { material })
  setComponent(materialEntity, UUIDComponent, material.uuid as EntityUUID)
  setComponent(materialEntity, SourceComponent, path as SceneID)
  const prototypeUUID = MaterialComponent.prototypeByName[material.type]
  setComponent(materialEntity, MaterialComponent, {
    material,
    prototypeUuid: prototypeUUID,
    parameters: Object.fromEntries(
      Object.keys(
        extractDefaults(
          getComponent(UUIDComponent.getEntityByUUID(prototypeUUID), MaterialComponent).prototypeArguments
        )
      ).map((k) => [k, material[k]])
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

export const createMaterialFromPrototype = (prototypeName: string, source: string, name: string) => {}

/**Sets a unique name and source hash for a given material entity */
export const setMaterialName = (entity: Entity, name: string) => {
  const materialComponent = getMutableComponent(entity, MaterialComponent)
  if (!materialComponent.material.value) return
  const oldName = getOptionalComponent(entity, NameComponent)
  if (oldName) {
    const oldHash = hashMaterial(getComponent(entity, SourceComponent), oldName)
    const preexistingMaterial = MaterialComponent.materialByHash[oldHash]
    //if the preexisting material is us then only update the hash
    if (preexistingMaterial && preexistingMaterial === getComponent(entity, UUIDComponent)) {
      delete MaterialComponent.materialByHash[oldHash]
      delete MaterialComponent.materialByName[oldName]
    }
    //if the preexisting material is not us, then we need to update the hash and add a suffix to the name
    if (preexistingMaterial && preexistingMaterial !== getComponent(entity, UUIDComponent)) {
      name = uniqueSuffix(name)
    }
  }

  const newHash = hashMaterial(getComponent(entity, SourceComponent), name)
  setComponent(entity, NameComponent, name)
  materialComponent.material.value.name = name
  MaterialComponent.materialByHash[newHash] = getComponent(entity, UUIDComponent)
  MaterialComponent.materialByName[name] = getComponent(entity, UUIDComponent)
}

const uniqueSuffix = (name: string) => {
  let i = 0
  while (MaterialComponent.materialByName[`${name}${materialSuffix}${i}`]) i++
  return `${name}${materialSuffix}${i}`
}

export const createPrototype = (
  name: string,
  prototypeArguments: PrototypeArgument,
  material: Material,
  source: string
) => {
  const prototypeEntity = createEntity()
  setComponent(prototypeEntity, MaterialComponent, {
    material,
    prototypeName: name,
    prototypeArguments
  })
  setComponent(prototypeEntity, NameComponent, name)
  setComponent(prototypeEntity, UUIDComponent, generateEntityUUID())
  setComponent(prototypeEntity, SourceComponent, source as SceneID)
  /**@todo handle duplicate prototype names */
  if (MaterialComponent.prototypeByName[name]) throw new Error('Prototype already exists')
  MaterialComponent.prototypeByName[name] = getComponent(prototypeEntity, UUIDComponent)
}

export function injectDefaults(defaultArgs, values) {
  return Object.fromEntries(
    Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, { ...v, default: values[k] }])
  )
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

export const setMaterialToDefaults = (materialUUID: string) => {
  const material = getComponent(UUIDComponent.getEntityByUUID(materialUUID as EntityUUID), MaterialComponent)
  const prototype = getComponent(
    UUIDComponent.getEntityByUUID(material.prototypeUuid as EntityUUID),
    MaterialComponent
  ).prototypeArguments
  return injectDefaults(prototype, material.parameters)
}

// export function protoIdToFactory(protoId: string): (parms: any) => Material {
//   const prototype = prototypeFromId(protoId)
//   return (parms) => {
//     const defaultParms = extractDefaults(prototype.arguments)
//     const formattedParms = { ...defaultParms, ...parms }
//     const result = new prototype.baseMaterial(formattedParms)
//     if (prototype.onBeforeCompile) {
//       result.onBeforeCompile = prototype.onBeforeCompile
//       result.needsUpdate = true
//     }
//     return result
//   }
// }

// export function materialIdToFactory(matId: string): (parms: any) => Material {
//   const material = materialFromId(matId)
//   const prototype = prototypeFromId(material.prototype)
//   return (parms) => {
//     const formattedParms = { ...material.parameters, ...parms }
//     const result = new prototype.baseMaterial(formattedParms)
//     if (prototype.onBeforeCompile) {
//       result.onBeforeCompile = prototype.onBeforeCompile
//       result.needsUpdate = true
//     }
//     return result
//   }
// }

export const hashMaterial = (source: string, name: string) => {
  return `${stringHash(source) ^ stringHash(name)}`
}

// export function addMaterialSource(src: MaterialSource): boolean {
//   const materialLibrary = getMutableState(MaterialLibraryState)
//   const srcId = hashMaterialSource(src)
//   if (!materialLibrary.sources[srcId].value) {
//     materialLibrary.sources[srcId].set({ src, entries: [] })
//     return true
//   } else return false
// }

// export function getSourceItems(src: MaterialSource): string[] | undefined {
//   const materialLibrary = getState(MaterialLibraryState)
//   return materialLibrary.sources[hashMaterialSource(src)]?.entries
// }

export function getMaterialSource(material: Material): string | null {
  const materialLibrary = getState(MaterialLibraryState)
  const matEntry = materialLibrary.materials[material.uuid]
  if (!matEntry) return null
  return matEntry.src.path
}

// export function removeMaterialSource(src: MaterialSource): boolean {
//   const materialLibrary = getMutableState(MaterialLibraryState)
//   const materialSelectionState = getMutableState(MaterialSelectionState)
//   const srcId = hashMaterialSource(src)
//   if (materialLibrary.sources[srcId].value) {
//     const srcComp = materialLibrary.sources[srcId].value
//     srcComp.entries.map((matId) => {
//       const toDelete = materialFromId(matId)
//       if (materialSelectionState.selectedMaterial.value === matId) {
//         materialSelectionState.selectedMaterial.set(null)
//       }
//       Object.values(toDelete.parameters)
//         .filter((val) => (val as Texture)?.isTexture)
//         .map((val: Texture) => val.dispose())
//       toDelete.material.dispose()
//       materialLibrary.materials[matId].set(none)
//     })
//     materialLibrary.sources[srcId].set(none)

//     return true
//   } else return false
// }

const sceneMeshQuery = defineQuery([MeshComponent, SourceComponent])

export function replaceMaterial(material: Material, nuMat: Material) {
  // for (const entity of sceneMeshQuery()) {
  //   const mesh = getComponent(entity, MeshComponent)
  //   if (Array.isArray(mesh.material)) {
  //     mesh.material.map((meshMat, i) => {
  //       if (material.uuid === meshMat.uuid) {
  //         mesh.material[i] = nuMat
  //       }
  //     })
  //   } else {
  //     if (mesh.material.uuid === material.uuid) {
  //       mesh.material = nuMat
  //     }
  //   }
  // }
}

export function changeMaterialPrototype(material: Material, protoId: string) {
  // const materialEntry = materialFromId(material.uuid)
  // if (materialEntry.prototype === protoId) return
  // const prototype = prototypeFromId(protoId)
  // const factory = protoIdToFactory(protoId)
  // const matKeys = Object.keys(material)
  // const commonParms = Object.fromEntries(
  //   Object.keys(prototype.arguments)
  //     .filter((key) => matKeys.includes(key))
  //     .map((key) => [key, material[key]])
  // )
  // const fullParms = { ...extractDefaults(prototype.arguments), ...commonParms }
  // const nuMat = factory(fullParms)
  // if (nuMat.plugins) {
  //   nuMat.customProgramCacheKey = () => nuMat.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
  // }
  // replaceMaterial(material, nuMat)
  // nuMat.uuid = material.uuid
  // nuMat.name = material.name
  // if (material.defines?.['USE_COLOR']) {
  //   nuMat.defines = nuMat.defines ?? {}
  //   nuMat.defines!['USE_COLOR'] = material.defines!['USE_COLOR']
  // }
  // nuMat.userData = {
  //   ...nuMat.userData,
  //   ...Object.fromEntries(Object.entries(material.userData).filter(([k, v]) => k !== 'type'))
  // }
  // materialEntry.plugins.map((pluginId: string) => {})
  // registerMaterial(nuMat, materialEntry.src)
  // return nuMat
}

// export function entryId(
//   entry: MaterialComponentType | MaterialPrototypeComponentType | MaterialSourceComponentType,
//   type: LibraryEntryType
// ) {
//   switch (type) {
//     case LibraryEntryType.MATERIAL:
//       return (entry as MaterialComponentType).material.uuid
//     case LibraryEntryType.MATERIAL_PROTOTYPE:
//       return (entry as MaterialPrototypeComponentType).prototypeId
//     case LibraryEntryType.MATERIAL_SOURCE:
//       return hashMaterialSource((entry as MaterialSourceComponentType).src)
//   }
// }
