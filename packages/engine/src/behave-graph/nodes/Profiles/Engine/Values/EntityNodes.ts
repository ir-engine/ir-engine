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

import { Entity } from '../../../../../ecs/classes/Entity.js'
import { defineQuery, getComponent } from '../../../../../ecs/functions/ComponentFunctions.js'
import { NameComponent } from '../../../../../scene/components/NameComponent.js'
import { SceneObjectComponent } from '../../../../../scene/components/SceneObjectComponent.js'
import { makeInNOutFunctionDesc } from '../../../Nodes/FunctionNode.js'
import { makeFunctionNodeDefinition, NodeCategory } from '../../../Nodes/NodeDefinitions.js'

// Unreal Engine Integer Blueprints API: https://docs.unrealengine.com/4.27/en-US/BlueprintAPI/Math/Integer/

const sceneQuery = defineQuery([SceneObjectComponent])
export const getEntity = makeFunctionNodeDefinition({
  typeName: 'engine/getEntity',
  category: NodeCategory.Query,
  label: 'Get entity',
  in: {
    entity: (_, graphApi) => {
      return {
        valueType: 'entity',
        choices: sceneQuery().map((entity) => ({ text: getComponent(entity, NameComponent), value: entity }))
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write, graph }) => {
    write('entity', read('entity'))
  }
})

export const Constant = makeInNOutFunctionDesc({
  name: 'engine/entity',
  label: 'Entity',
  in: ['entity'],
  out: 'entity',
  exec: (a: Entity) => a
})

export const Equal = makeInNOutFunctionDesc({
  name: 'engine/equal/entity',
  label: 'Entity =',
  in: ['entity', 'entity'],
  out: 'boolean',
  exec: (a: Entity, b: Entity) => a === b
})
