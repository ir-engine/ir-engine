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

import { TextButton } from '@ir-engine/client-core/src/components/Glass/buttons/TextButton'
import { useFind } from '@ir-engine/common'
import { scopePath } from '@ir-engine/common/src/schema.type.module'
import { Meta, StoryObj } from '@storybook/react/*'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleMocks } from '../.storybook/util'

const meta = {
  title: 'Base/Engine',
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

export const Navigation: StoryObj = {
  render: () => {
    const navigate = useNavigate()
    const location = useLocation()
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-transparent">
        <TextButton fade={'darker'} onClick={() => navigate('/chat')}>
          Navigate To /chat
        </TextButton>
        <TextButton fade={'darker'} onClick={() => navigate('/')}>
          Navigate To /
        </TextButton>
        <div>Current path: {location.pathname}</div>
      </div>
    )
  }
}

export const Websockets: StoryObj = {
  render: () => {
    const scopeQuery = useFind(scopePath, { query: { userId: 0, type: 'admin:admin' } })

    return (
      <div>
        Below is a demo of a mocked websocket response <br /> {JSON.stringify({ ...scopeQuery, scopePath })}
      </div>
    )
  },
  parameters: {
    msw: {
      handlers: handleMocks({
        'scope.find': () => ({
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
        })
      })
    }
  }
}
