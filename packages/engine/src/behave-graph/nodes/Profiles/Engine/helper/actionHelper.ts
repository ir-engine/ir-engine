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

import { NodeCategory, NodeDefinition, makeFlowNodeDefinition } from '@behave-graph/core'
import { Action, ActionDefinitions, dispatchAction } from '@etherealengine/hyperflux'
import { startCase } from 'lodash'
import matches from 'ts-matches'
import { NodetoEnginetype } from './commonHelper'

const skipAction = ['']

const getParserType = (value) => {
  switch (value) {
    case matches.boolean:
      return 'boolean'
    case matches.string:
      return 'string'
    case matches.number:
      return 'float'
    default:
      return null
  }
}

export function generateActionNodeSchema(action) {
  const nodeschema = {}
  const schema = action
  if (schema === null) {
    return nodeschema
  }
  if (schema === undefined) {
    return nodeschema
  }
  for (const [name, value] of Object.entries(schema)) {
    const socketValue = getParserType(value)

    if (socketValue) nodeschema[name] = socketValue
  }
  return nodeschema
}

export function getActionDispatchers() {
  const dispatchers: NodeDefinition[] = []
  const skipped: string[] = []
  for (const [actionType, action] of Object.entries(ActionDefinitions)) {
    const { type, ...actionDef } = action.actionShape
    const actionInput = {}
    if (skipAction.includes(actionType)) {
      skipped.push(actionType)
      continue
    }
    const inputsockets = generateActionNodeSchema(actionDef)
    if (Object.keys(inputsockets).length === 0) {
      skipped.push(actionType)
      continue
    }
    const nameArray = type.split('.')
    const dispatchName = startCase(nameArray.pop().toLowerCase())
    const namePath = nameArray.splice(1).join('/')

    const node = makeFlowNodeDefinition({
      typeName: `action/${namePath}/dispatch${dispatchName}`,
      category: NodeCategory.Action,
      label: `dispatch ${namePath} ${dispatchName}`,
      in: {
        flow: 'flow',
        ...inputsockets
      },
      out: { flow: 'flow' },
      initialState: undefined,
      triggered: ({ read, write, commit, graph }) => {
        //read from the read and set dict acccordingly
        const inputs = Object.entries(node.in).splice(1)
        for (const [input, type] of inputs) {
          actionInput[input] = NodetoEnginetype(read(input as any), type)
        }
        console.log('DEBUG action is ', actionInput)
        dispatchAction(ActionDefinitions[type](actionInput as Action))
        commit('flow')
      }
    })
    dispatchers.push(node)
  }
  return dispatchers
}
