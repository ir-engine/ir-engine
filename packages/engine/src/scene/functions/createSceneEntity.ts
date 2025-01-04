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
  Entity,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getOptionalComponent,
  setComponent
} from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Group } from 'three'
import { SourceComponent } from '../components/SourceComponent'

export const createSceneEntity = (name: string, parentEntity: Entity = UndefinedEntity): Entity => {
  const entity = createEntity()
  setComponent(entity, NameComponent, name)
  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  if (parentEntity !== UndefinedEntity) {
    setComponent(entity, EntityTreeComponent, { parentEntity })
  }
  const sceneID = getOptionalComponent(parentEntity, SourceComponent)
  if (sceneID != null) {
    setComponent(entity, SourceComponent, sceneID)
  }

  setComponent(entity, UUIDComponent, generateEntityUUID())

  // These additional properties and relations are required for
  // the current GLTF exporter to successfully generate a GLTF.
  const obj3d = new Group()
  obj3d.entity = entity
  setComponent(entity, ObjectComponent, obj3d)

  return entity
}
