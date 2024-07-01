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
  createEntity,
  defineQuery,
  Entity,
  EntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  setComponent,
  UUIDComponent
} from '@etherealengine/ecs'
import { stringHash } from '@etherealengine/spatial/src/common/functions/MathFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import {
  MaterialInstanceComponent,
  MaterialPlugins,
  MaterialPrototypeComponent,
  MaterialStateComponent
} from '@etherealengine/spatial/src/renderer/materials/MaterialComponent'
import { extractDefaults } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'

import { MaterialExtensionPluginType } from '../../../assets/exporters/gltf/extensions/EEMaterialExporterExtension'
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
    if (hasComponent(entity, MaterialInstanceComponent)) {
      const materialComponent = getComponent(entity, MaterialInstanceComponent)
      for (const mat of materialComponent.uuid!) {
        materials[mat] = entity
      }
    }
  }
  return Object.keys(materials) as any as EntityUUID[]
}

/** Creates and uses a new material entity from a GLTF. If a material from the GLTF path already exists in-scene, uses preexisting entity instead. */
export const createMaterialInstance = (path: string, sourceEntity: Entity, material: Material) => {
  //if we already have a material by the same name from the same source, use it instead
  const entityFromHash = MaterialStateComponent.materialByHash[hashMaterial(path, material.name)]
  setComponent(sourceEntity, MaterialInstanceComponent)
  const materialComponent = getMutableComponent(sourceEntity, MaterialInstanceComponent)
  const uuids = materialComponent.uuid.value

  if (entityFromHash) {
    materialComponent.uuid.set([...uuids, entityFromHash])
    const materialStateComponent = getMutableComponent(
      UUIDComponent.getEntityByUUID(entityFromHash),
      MaterialStateComponent
    )
    materialStateComponent.instances.set([...materialStateComponent.instances.value, sourceEntity])

    return entityFromHash
  }
  const newUUID = material.uuid as EntityUUID
  materialComponent.uuid.set([...uuids, newUUID])

  if (!UUIDComponent.getEntityByUUID(newUUID)) {
    if (material.plugins) {
      material.customProgramCacheKey = () =>
        material.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
    }
    const materialEntity = createMaterialEntity(material, path)
    const materialStateComponent = getMutableComponent(materialEntity, MaterialStateComponent)
    if (!materialStateComponent.instances.value) return
    materialStateComponent.instances.set([...materialStateComponent.instances.value, sourceEntity])
  }
}

export const createMaterialEntity = (material: Material, path?: string, user?: Entity) => {
  const materialEntity = createEntity()
  setComponent(materialEntity, UUIDComponent, material.uuid as EntityUUID)
  if (path) setComponent(materialEntity, SourceComponent, path)
  const prototypeEntity = getPrototypeEntityFromName(material.userData.type || material.type)
  if (!prototypeEntity) throw new PrototypeNotFoundError(`Material prototype ${material.type} not found`)
  setComponent(materialEntity, MaterialStateComponent, {
    material,
    prototypeEntity,
    parameters: Object.fromEntries(
      Object.keys(extractDefaults(getComponent(prototypeEntity, MaterialPrototypeComponent).prototypeArguments)).map(
        (k) => [k, material[k]]
      )
    ),
    instances: user != undefined ? [user] : []
  })
  if (material.userData?.plugins)
    material.userData.plugins.map((plugin: MaterialExtensionPluginType) => {
      if (!plugin) return
      setComponent(materialEntity, MaterialPlugins[plugin.id])
      const pluginComponent = getComponent(materialEntity, MaterialPlugins[plugin.id])
      for (const [k, v] of Object.entries(plugin.uniforms)) {
        if (v) pluginComponent[k].value = v
      }
    })
  setMaterialName(materialEntity, material.name)
  return materialEntity
}

export const removeMaterial = (entity: Entity) => {
  const name = getComponent(entity, NameComponent)
  if (hasComponent(entity, SourceComponent)) {
    const hash = hashMaterial(getComponent(entity, SourceComponent), name)
    delete MaterialStateComponent.materialByHash[hash]
  }
  removeEntity(entity)
}

const prototypeQuery = defineQuery([MaterialPrototypeComponent])
export const getPrototypeEntityFromName = (name: string) =>
  prototypeQuery().find((entity) => getComponent(entity, NameComponent) === name)

/**Sets a name and source hash for a given material entity */
export const setMaterialName = (entity: Entity, name: string) => {
  const canHash = name !== '' && hasComponent(entity, SourceComponent)
  if (name === '') name = 'Material'
  const materialComponent = getMutableComponent(entity, MaterialStateComponent)
  if (!materialComponent.material.value) return
  const oldName = getOptionalComponent(entity, NameComponent)
  if (oldName && canHash) {
    const oldHash = hashMaterial(getComponent(entity, SourceComponent), oldName)
    const preexistingMaterial = MaterialStateComponent.materialByHash[oldHash]
    if (preexistingMaterial && preexistingMaterial === getComponent(entity, UUIDComponent)) {
      delete MaterialStateComponent.materialByHash[oldHash]
    }
  }

  setComponent(entity, NameComponent, name)
  ;(materialComponent.material.value as Material).name = name
  if (!canHash) return
  const newHash = hashMaterial(getComponent(entity, SourceComponent), name)
  MaterialStateComponent.materialByHash[newHash] = getComponent(entity, UUIDComponent)
}

export const injectMaterialDefaults = (materialUUID: EntityUUID) => {
  const material = getOptionalComponent(UUIDComponent.getEntityByUUID(materialUUID), MaterialStateComponent)
  if (!material?.prototypeEntity) return
  const prototype = getComponent(material.prototypeEntity, MaterialPrototypeComponent).prototypeArguments
  if (!prototype) return
  return Object.fromEntries(
    Object.entries(prototype).map(([k, v]: [string, any]) => [k, { ...v, default: material.parameters![k] }])
  )
}

export const hashMaterial = (source: string, name: string) => {
  return `${stringHash(source) ^ stringHash(name)}`
}
