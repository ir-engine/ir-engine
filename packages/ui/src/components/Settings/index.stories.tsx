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

import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import SettingsMenu from '.'

const meta = {
  title: 'UI/Settings Menu',
  component: SettingsMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A settings menu component with iPhone-like slide transitions between screens.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'closed' }
  }
} satisfies Meta<typeof SettingsMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover'
        }}
      >
        <button
          className="rounded-md bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Settings' : 'Open Settings'}
        </button>
        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  }
}

export const WithColorfulBackground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover'
        }}
      >
        <button
          className="rounded-md bg-white/20 px-6 py-3 font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/30"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Settings' : 'Open Settings'}
        </button>
        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  }
}

export const WithGradientBackground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
        style={{
          background: 'linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)'
        }}
      >
        <button
          className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Settings' : 'Open Settings'}
        </button>
        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  }
}
