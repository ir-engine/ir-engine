import { SceneID } from '@etherealengine/common/src/schema.type.module'
import { Entity, EntityUUID, UUIDComponent, createEntity, getMutableComponent, setComponent } from '@etherealengine/ecs'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { MaterialSource } from '@etherealengine/engine/src/scene/materials/components/MaterialSource'
import { Material } from 'three'
import { stringHash } from '../../common/functions/MathFunctions'
import { MaterialComponent } from './MaterialComponent'

export const registerMaterialInstance = (material: Material, entity: Entity) => {
  const materialEntity = UUIDComponent.getEntityByUUID(material.uuid as EntityUUID)
  const materialComponent = getMutableComponent(materialEntity, MaterialComponent)
  materialComponent.instances.set([...materialComponent.instances.value, entity])
}

export const registerMaterial = (material: Material, src: MaterialSource, params?: { [_: string]: any }) => {
  const materialEntity = createEntity()

  setComponent(materialEntity, MaterialComponent, { material })
  setComponent(materialEntity, UUIDComponent, material.uuid as EntityUUID)
  setComponent(materialEntity, SourceComponent, src.path as SceneID)
  setComponent(materialEntity, MaterialComponent, { hash: hashMaterial(src.path, material.name) })

  return materialEntity
}

export const hashMaterial = (source: string, name: string) => {
  return `${stringHash(source) ^ stringHash(name)}`
}
