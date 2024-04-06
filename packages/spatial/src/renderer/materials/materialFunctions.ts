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
