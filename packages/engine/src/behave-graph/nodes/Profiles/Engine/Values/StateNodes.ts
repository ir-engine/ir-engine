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

import { NodeCategory, makeFunctionNodeDefinition, makeInNOutFunctionDesc } from '@behave-graph/core'
import { Engine } from '../../../../../ecs/classes/Engine'
import { EEScene } from '../Abstractions/Drivers/eeScene'

export const getPropertyFromState = makeFunctionNodeDefinition({
  typeName: 'engine/state/getPropertyFromState',
  category: NodeCategory.Query,
  label: 'Get Property',
  in: {
    property: (_, graphApi) => {
      const scene = graphApi.getDependency<EEScene>('IScene')
      const choices = scene!.getStateProperties()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { value: 'string' },
  exec: ({ read, write, graph }) => {
    const propertyPath = read<string>('property')
    const path = propertyPath.split('.')
    let value = Engine.instance.store.valueMap
    for (const key of path) {
      if (!(key in value)) {
        break
      }
      value = value[key]
    }

    write('value', value)
  }
})

export const Constant = makeInNOutFunctionDesc({
  name: 'engine/state',
  label: 'State',
  in: ['state'],
  out: 'state',
  exec: (a) => a
})

export const Equal = makeInNOutFunctionDesc({
  name: 'engine/equal/state',
  label: 'State =',
  in: ['state', 'state'],
  out: 'boolean',
  exec: (a, b) => a === b
})
