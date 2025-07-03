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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { EngineState } from '@ir-engine/ecs'
import { getMutableState, UserID } from '@ir-engine/hyperflux'
import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import SettingsMenu, { screens } from '.'
import { ViewerInteractions } from '../Glass'

const meta = {
  title: 'Viewer/Toolbar',
  component: SettingsMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A settings menu component with iPhone-like slide transitions between screens.'
      }
    }
  },
  tags: ['autodocs'],
  globals: {
    screen: 'main'
  },
  args: {
    initScreen: 'main'
  },
  argTypes: {
    onClose: { action: 'closed' },
    initScreen: {
      control: 'select',
      options: Object.keys(screens)
    }
  }
} satisfies Meta<typeof SettingsMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  globals: {
    backgrounds: { value: 'rgb(30 30 30)' }
  },
  render: () => {
    getMutableState(EngineState).userID.set('1' as UserID)
    useEffect(() => {
      const el = document.getElementById('location-container')
      if (el) el.style.opacity = '1'
    }, [])

    return <ViewerInteractions />
  }
}
