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

import { NodeCategory, makeEventNodeDefinition } from '@behave-graph/core'
import { Query, defineQuery, getComponent, removeQuery } from '../../../../../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../../../../../ecs/functions/EngineFunctions'
import { SystemUUID, defineSystem, disableSystem, startSystem } from '../../../../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../../../../../input/components/InputSourceComponent'

let systemCounter = 0

const initialState = () => ({
  query: undefined! as Query,
  systemUUID: '' as SystemUUID
})

// very 3D specific.
export const OnSceneNodeClick = makeEventNodeDefinition({
  typeName: 'engine/buttonState',
  category: NodeCategory.Event,
  label: 'On Button State',
  in: {
    button: 'string',
    state: 'string'
  },
  out: {
    flow: 'flow'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph }) => {
    const buttonKey = read<string>('button')
    const buttonState = read<string>('state')

    const query = defineQuery([InputSourceComponent])
    const systemUUID = defineSystem({
      uuid: 'behave-graph-onButton-' + systemCounter++,
      execute: () => {
        for (const eid of query()) {
          const inputSource = getComponent(eid, InputSourceComponent)
          if (inputSource.buttons[buttonKey]?.[buttonState]) commit('flow')
        }
      }
    })

    startSystem(systemUUID, { with: InputSystemGroup })

    return {
      systemUUID,
      query
    }
  },
  dispose: ({ state, graph: { getDependency } }) => {
    disableSystem(state.systemUUID)
    removeQuery(state.query)
    return initialState()
  }
})
