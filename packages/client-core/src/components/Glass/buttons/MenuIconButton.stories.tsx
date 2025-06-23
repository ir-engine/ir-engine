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

import { CogMd, ShoppingBag03Lg } from '@ir-engine/ui/src/icons'
import React from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { EmoteM as EmoteIcon } from '@ir-engine/ui/src/icons'
import { BsChatLeftTextFill as MessageIcon } from 'react-icons/bs'
import { IoSettingsSharp as SettingsIcon } from 'react-icons/io5'
import { RiShareForwardFill as ShareIcon } from 'react-icons/ri'

import {
  BsCameraVideoOffFill as CameraOffIcon,
  BsCameraVideoFill as CameraOnIcon,
  BsMicMuteFill as MicrophoneOffIcon,
  BsMicFill as MicrophoneOnIcon
} from 'react-icons/bs'
import { twMerge } from 'tailwind-merge'
import { EmoteMenu } from '../EmoteMenu'
import { containerStyles, gridStyles_base, sectionStyles_base } from '../ToolbarMenu'
import { MenuIconButton as Component } from './MenuIconButton'
const meta: Meta<typeof Component> = {
  title: 'ClientCore/Buttons/MenuIconButton',
  component: Component,
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    active: false,
    loading: false,
    children: <ShoppingBag03Lg />
  }
}

export const WithBadge: Story = {
  args: {
    active: false,
    loading: false,
    badge: {
      number: 5,
      show: true
    },
    children: <CogMd />
  }
}

const verticalGridStyles = twMerge(
  gridStyles_base,
  `
  flex-col
  py-4
`
)

const horizontalGridStyles = twMerge(
  gridStyles_base,
  `
  flex-row
  flex-row-reverse
  px-5 py-1 pl-6
`
)

const verticalSectionStyles = twMerge(
  sectionStyles_base,
  `
  inline-flex origin-bottom flex-col
  items-center
  px-3
`
)

const horizontalSectionStyles = twMerge(
  sectionStyles_base,
  `
  inline-flex
  origin-left
  
  flex-row
  items-center
  px-0
`
)

export const ToolbarVertical: Story = {
  render: () => {
    return (
      <>
        <div className={`flex gap-4 p-4`}>
          <div className={containerStyles}>
            <div className={verticalGridStyles}>
              <div className={verticalSectionStyles}>
                <Component>
                  <EmoteIcon />
                </Component>
                <Component>
                  <ShareIcon />
                </Component>
                <Component badge={{ number: 3, show: true, position: 'top' }}>
                  <SettingsIcon />
                </Component>
                <Component>
                  <CameraOffIcon />
                </Component>
                <Component>
                  <MicrophoneOffIcon />
                </Component>
                <Component>
                  <MessageIcon />
                </Component>
              </div>
            </div>
          </div>
          <div className={containerStyles}>
            <div className={verticalGridStyles}>
              <div className={verticalSectionStyles}>
                <Component>
                  <EmoteIcon />
                </Component>
                <Component>
                  <ShareIcon />
                </Component>
                <Component>
                  <SettingsIcon />
                </Component>
                <Component>
                  <CameraOnIcon />
                </Component>
                <Component>
                  <MicrophoneOnIcon />
                </Component>
                <Component>
                  <MessageIcon />
                </Component>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export const ToolbarHorizontal: Story = {
  render: () => {
    return (
      <>
        <div className={`flex gap-4 p-4`}>
          <div className={containerStyles}>
            <div className={horizontalGridStyles}>
              <div className={horizontalSectionStyles}>
                <Component badge={{ number: 5, show: true, position: 'top' }}>
                  <EmoteIcon />
                </Component>
                <Component>
                  <CameraOnIcon />
                </Component>
                <Component>
                  <MicrophoneOnIcon />
                </Component>
                <Component>
                  <MessageIcon />
                </Component>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export const ToolbarEmote: Story = {
  render: () => {
    return (
      <>
        <div className={`flex gap-4 p-4`}>
          <div className={containerStyles}>
            <div className={horizontalGridStyles}>
              <div className={horizontalSectionStyles}>
                <EmoteMenu />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
