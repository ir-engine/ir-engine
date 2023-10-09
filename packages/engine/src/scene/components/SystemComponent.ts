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

import { ComponentType, defineComponent } from '../../ecs/functions/ComponentFunctions'
import { InputSystemGroup, PresentationSystemGroup, SimulationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { SystemUUID } from '../../ecs/functions/SystemFunctions'

export const SystemComponent = defineComponent({
  name: 'SystemComponent',
  jsonID: 'system',

  onInit(entity) {
    return {
      filePath: '',
      insertUUID: '' as SystemUUID,
      insertOrder: '' as 'before' | 'with' | 'after',
      enableClient: true,
      enableServer: true,
      args: {} as Record<any, any>
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    // backwards compat
    convertSystemComponentJSON(json as any)

    if (typeof json.filePath === 'string') component.filePath.set(json.filePath)
    if (typeof json.insertUUID === 'string') component.insertUUID.set(json.insertUUID)
    if (typeof json.insertOrder === 'string') component.insertOrder.set(json.insertOrder)
    if (typeof json.enableClient === 'boolean') component.enableClient.set(json.enableClient)
    if (typeof json.enableServer === 'boolean') component.enableServer.set(json.enableServer)
    if (typeof json.args === 'object') component.args.set(json.args)
  },

  toJSON(entity, component) {
    return {
      filePath: component.filePath.value,
      insertUUID: component.insertUUID.value,
      insertOrder: component.insertOrder.value,
      enableClient: component.enableClient.value,
      enableServer: component.enableServer.value
      // args: component.args.get(NO_PROXY)
    }
  }
})

/**
 * Converts old system update types to new insert order and insert uuid
 * @param json
 * @returns
 */
export const convertSystemComponentJSON = (
  json: ComponentType<typeof SystemComponent> & { systemUpdateType: string }
) => {
  if (typeof json.systemUpdateType === 'string') {
    switch (json.systemUpdateType) {
      case 'UPDATE_EARLY':
        json.insertOrder = 'before'
        json.insertUUID = InputSystemGroup
        break
      case 'UPDATE':
        json.insertOrder = 'with'
        json.insertUUID = InputSystemGroup
        break
      case 'UPDATE_LATE':
        json.insertOrder = 'after'
        json.insertUUID = InputSystemGroup
        break
      case 'FIXED_EARLY':
        json.insertOrder = 'before'
        json.insertUUID = SimulationSystemGroup
        break
      case 'FIXED':
        json.insertOrder = 'with'
        json.insertUUID = SimulationSystemGroup
        break
      case 'FIXED_LATE':
        json.insertOrder = 'after'
        json.insertUUID = SimulationSystemGroup
        break
      case 'PRE_RENDER':
        json.insertOrder = 'before'
        json.insertUUID = PresentationSystemGroup
        break
      case 'RENDER':
        json.insertOrder = 'with'
        json.insertUUID = PresentationSystemGroup
        break
      case 'POST_RENDER':
        json.insertOrder = 'after'
        json.insertUUID = PresentationSystemGroup
        break
    }
  }
  return json
}
