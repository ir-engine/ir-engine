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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useFind } from '@ir-engine/common'
import { scopePath } from '@ir-engine/common/src/schema.type.module'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { Meta, StoryObj } from '@storybook/react/*'
import { ws } from 'msw'
import React from 'react'
const meta = {
  title: 'UI/Viewer',
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
} satisfies Meta

export default meta

export const Default: StoryObj = {
  render: () => {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-transparent">
        <div className="max-[30ch] rounded-md bg-white/60 p-4">
          Toggle the Napster Engine and Location butons in the toolbar to change the scene
        </div>
      </div>
    )
  }
}

const primus = ws.link(/primus/g)

export const WSS: StoryObj = {
  render: () => {
    const scopeQuery = useFind(scopePath, { query: { userId: 0, type: 'admin:admin' } })

    return <div>{JSON.stringify({ ...scopeQuery, scopePath })}</div>
  },
  parameters: {
    msw: {
      handlers: [
        primus.addEventListener('connection', (socket) => {
          const io = toSocketIo(socket)
          io.client.on('data', () => {
            console.log('DATA')
          })
          socket.client.addEventListener('message', () => {
            console.log('RAW')

            // Mock response for scope service find method
            const response = {
              id: 1,
              type: 1,
              data: [
                null,
                {
                  total: 1,
                  limit: 10,
                  skip: 0,
                  data: [
                    {
                      id: '5bfb0678-7bda-4381-8eff-8e27c6cf6bad',
                      userId: 'a3561f56-175d-4049-a2ba-057c4231b6f4',
                      type: 'admin:admin',
                      accountId: null,
                      createdAt: '2025-06-24T20:20:28.000Z',
                      updatedAt: '2025-06-24T20:20:28.000Z'
                    }
                  ]
                }
              ]
            }
            socket.client.send(JSON.stringify(response))
          })
        })
      ]
    }
  }
}
