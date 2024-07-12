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

import { useEffect } from 'react'
import { Object3D } from 'three'

import {
  createEntity,
  Entity,
  generateEntityUUID,
  removeEntity,
  setComponent,
  UUIDComponent
} from '@etherealengine/ecs'
import { State, useHookstate } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'

export function useHelperEntity<
  TObject extends Object3D,
  TComponent extends State<Partial<{ name: string; entity: Entity }>>
>(
  entity: Entity,
  component: TComponent,
  helper: TObject | undefined = undefined,
  layerMask = ObjectLayerMasks.NodeHelper
): Entity {
  const helperEntityState = useHookstate<Entity>(createEntity)

  useEffect(() => {
    const helperEntity = helperEntityState.value
    if (helper) {
      helper.name = `${component.name.value}-${entity}`
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
    }
    setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(helperEntity, UUIDComponent, generateEntityUUID())
    setComponent(helperEntity, ObjectLayerMaskComponent, layerMask)
    setVisibleComponent(helperEntity, true)
    component.entity.set(helperEntity)

    return () => {
      removeEntity(helperEntity)
    }
  }, [])

  return helperEntityState.value
}
