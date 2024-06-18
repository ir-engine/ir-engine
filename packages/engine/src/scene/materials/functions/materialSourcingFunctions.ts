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
import { ComponentType } from '@etherealengine/ecs/src/ComponentFunctions'
import { State } from '@etherealengine/hyperflux'
import { stringHash } from '@etherealengine/spatial/src/common/functions/MathFunctions'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import {
  materialByHash,
  MaterialComponent,
  MaterialComponents,
  MaterialPlugins,
  prototypeByName
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
    if (hasComponent(entity, MaterialComponent[MaterialComponents.Instance])) {
      const materialComponent = getComponent(entity, MaterialComponent[MaterialComponents.Instance])
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
  const entityFromHash = materialByHash[hashMaterial(path, material.name)]
  setComponent(sourceEntity, MaterialComponent[MaterialComponents.Instance])
  const materialComponent = getMutableComponent(sourceEntity, MaterialComponent[MaterialComponents.Instance]) as State<
    ComponentType<(typeof MaterialComponent)[0]>
  >
  const uuids = materialComponent.uuid.value
  if (!uuids) return

  if (entityFromHash) {
    materialComponent.uuid.set([...uuids, entityFromHash])
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
    const materialEntityComponent = getMutableComponent(materialEntity, MaterialComponent[MaterialComponents.State])
    if (!materialEntityComponent.instances.value) return
    materialEntityComponent.instances.set([...materialEntityComponent.instances.value, sourceEntity])
  }
}

export const createMaterialEntity = (material: Material, path?: string, user?: Entity) => {
  const materialEntity = createEntity()
  setComponent(materialEntity, UUIDComponent, material.uuid as EntityUUID)
  if (path) setComponent(materialEntity, SourceComponent, path)
  const prototypeEntity = prototypeByName[material.type]
  setComponent(materialEntity, MaterialComponent[MaterialComponents.State], {
    material,
    prototypeEntity,
    parameters: Object.fromEntries(
      Object.keys(
        extractDefaults(
          getComponent(prototypeEntity, MaterialComponent[MaterialComponents.Prototype]).prototypeArguments
        )
      ).map((k) => [k, material[k]])
    ),
    instances: user != undefined ? [user] : []
  })
  if (material.userData?.plugins)
    material.userData.plugins.map((plugin: MaterialExtensionPluginType) => {
      if (!plugin) return
      setComponent(materialEntity, MaterialPlugins[plugin.id])
      const pluginComponent = getMutableComponent(materialEntity, MaterialPlugins[plugin.id])
      for (const [k, v] of Object.entries(plugin.uniforms)) {
        if (v) pluginComponent[k].set(v)
      }
    })
  setMaterialName(materialEntity, material.name)
  return materialEntity
}

export const removeMaterial = (entity: Entity) => {
  const name = getComponent(entity, NameComponent)
  const hash = hashMaterial(getComponent(entity, SourceComponent), name)
  delete materialByHash[hash]
  removeEntity(entity)
}

export const getPrototypeConstructorFromName = (name: string) => {
  const prototypeEntity = prototypeByName[name]
  if (!prototypeEntity) return null
  return getComponent(prototypeEntity, MaterialComponent[MaterialComponents.Prototype]).prototypeConstructor!
}

/**Sets a name and source hash for a given material entity */
export const setMaterialName = (entity: Entity, name: string) => {
  const canHash = name !== '' && hasComponent(entity, SourceComponent)
  if (name === '') name = 'Material'
  const materialComponent = getMutableComponent(entity, MaterialComponent[MaterialComponents.State])
  if (!materialComponent.material.value) return
  const oldName = getOptionalComponent(entity, NameComponent)
  if (oldName) {
    const oldHash = hashMaterial(getComponent(entity, SourceComponent), oldName)
    const preexistingMaterial = materialByHash[oldHash]
    if (preexistingMaterial && preexistingMaterial === getComponent(entity, UUIDComponent)) {
      delete materialByHash[oldHash]
    }
  }

  setComponent(entity, NameComponent, name)
  ;(materialComponent.material.value as Material).name = name
  if (!canHash) return
  const newHash = hashMaterial(getComponent(entity, SourceComponent), name)
  materialByHash[newHash] = getComponent(entity, UUIDComponent)
}

export const injectMaterialDefaults = (materialUUID: EntityUUID) => {
  const material = getOptionalComponent(
    UUIDComponent.getEntityByUUID(materialUUID),
    MaterialComponent[MaterialComponents.State]
  )
  if (!material?.prototypeEntity) return
  const prototype = getComponent(
    material.prototypeEntity,
    MaterialComponent[MaterialComponents.Prototype]
  ).prototypeArguments
  if (!prototype) return
  return Object.fromEntries(
    Object.entries(prototype).map(([k, v]: [string, any]) => [k, { ...v, default: material.parameters![k] }])
  )
}

export const hashMaterial = (source: string, name: string) => {
  return `${stringHash(source) ^ stringHash(name)}`
}
