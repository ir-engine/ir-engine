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

import { Logger } from '../../Diagnostics/Logger.js'
import { getCoreRegistry } from '../../Profiles/Core/registerCoreProfile.js'
import { readGraphFromJSON } from './readGraphFromJSON.js'

Logger.onWarn.clear()

describe('readGraphFromJSON', () => {
  const registry = getCoreRegistry()
  it('throws if node ids are not unique', () => {
    const json = {
      variables: [],
      customEvents: [],
      nodes: [
        {
          type: 'lifecycle/onStart',
          id: '0'
        },
        {
          type: 'debug/log',
          id: '0'
        }
      ]
    }
    expect(() => readGraphFromJSON({ graphJson: json, ...registry, dependencies: {} })).toThrow()
  })

  it("throws if input keys don't match known sockets", () => {
    const json = {
      variables: [],
      customEvents: [],
      nodes: [
        {
          type: 'debug/log',
          id: '1',
          parameters: {
            wrong: { value: 'Hello World!' }
          }
        }
      ]
    }
    expect(() => readGraphFromJSON({ graphJson: json, ...registry, dependencies: {} })).toThrow()
  })

  it('throws if input points to non-existent node', () => {
    const json = {
      variables: [],
      customEvents: [],
      nodes: [
        {
          type: 'lifecycle/onStart',
          id: '0'
        },
        {
          type: 'debug/log',
          id: '1',
          parameters: {
            text: { value: 'Hello World!' }
          },
          flows: {
            flow: { nodeId: '2', socket: 'flow' }
          }
        }
      ]
    }
    expect(() => readGraphFromJSON({ graphJson: json, ...registry, dependencies: {} })).toThrow()
  })

  it('throws if input points to non-existent socket', () => {
    const json = {
      variables: [],
      customEvents: [],
      nodes: [
        {
          type: 'lifecycle/onStart',
          id: '0'
        },
        {
          type: 'debug/log',
          id: '1',
          parameters: {
            text: { value: 'Hello World!' }
          },
          flows: {
            flow: { nodeId: '0', socket: 'text' }
          }
        }
      ]
    }
    expect(() => readGraphFromJSON({ graphJson: json, ...registry, dependencies: {} })).toThrow()
  })
})
