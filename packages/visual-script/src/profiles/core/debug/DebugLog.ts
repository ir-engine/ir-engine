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

import { makeFlowNodeDefinition, NodeCategory } from '../../../VisualScriptModule'
import { ILogger, LogSeverity } from '../abstractions/ILogger'

export const Log = makeFlowNodeDefinition({
  typeName: 'debug/log',
  category: NodeCategory.Debug,
  label: 'Debug Log',
  in: {
    flow: 'flow',
    text: 'string',
    severity: {
      valueType: 'string',
      defaultValue: 'info',
      choices: ['verbose', 'info', 'warning', 'error'],
      label: 'severity'
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const logger = getDependency<ILogger>('ILogger')
    logger?.log(read<LogSeverity>('severity'), read<string>('text'))
    commit('flow')
  }
})
