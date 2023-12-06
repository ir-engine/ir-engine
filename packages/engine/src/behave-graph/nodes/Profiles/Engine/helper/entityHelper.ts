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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { MathUtils } from 'three'
import { Entity } from '../../../../../ecs/classes/Entity'
import { SceneState } from '../../../../../ecs/classes/Scene'
import {
  ComponentJSONIDMap,
  getComponent,
  hasComponent,
  setComponent
} from '../../../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../../../../ecs/functions/EntityTree'
import { UUIDComponent } from '../../../../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../../../../scene/components/VisibleComponent'
import { ComponentJsonType } from '../../../../../schemas/projects/scene.schema'
import { LocalTransformComponent } from '../../../../../transform/components/TransformComponent'

export const addEntityToScene = (
  componentJson: Array<ComponentJsonType>,
  parentEntity = SceneState.getRootEntity(),
  beforeEntity = null as Entity | null
) => {
  const newEntity = createEntity()
  let childIndex = undefined as undefined | number
  if (beforeEntity) {
    const beforeNode = getComponent(beforeEntity, EntityTreeComponent)
    if (beforeNode?.parentEntity && hasComponent(beforeNode.parentEntity, EntityTreeComponent)) {
      childIndex = getComponent(beforeNode.parentEntity, EntityTreeComponent).children.indexOf(beforeEntity)
    }
  }
  setComponent(newEntity, EntityTreeComponent, { parentEntity, childIndex })
  setComponent(newEntity, LocalTransformComponent)
  const uuid = MathUtils.generateUUID() as EntityUUID
  setComponent(newEntity, UUIDComponent, uuid)
  setComponent(newEntity, VisibleComponent)
  for (const component of componentJson) {
    if (ComponentJSONIDMap.has(component.name))
      setComponent(newEntity, ComponentJSONIDMap.get(component.name)!, component.props)
  }

  return newEntity
}
