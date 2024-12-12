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

import { ArgTypes, StoryObj } from '@storybook/react'
import React from 'react'

import { SquareSm } from '@ir-engine/ui/src/icons'
import StudioButton, { StudioButtonProps } from './index'

const sizes: StudioButtonProps['size'][] = ['xs', 'sm', 'l', 'xl']

const argTypes: ArgTypes = {
  disabled: {
    control: 'boolean'
  },
  startIcon: {
    control: 'boolean',
    name: 'Start Icon'
  },
  endIcon: {
    control: 'boolean',
    name: 'End Icon'
  },
  variant: {
    table: { disable: true }
  },
  rounded: {
    control: 'boolean'
  }
}

export default {
  title: 'Components/Editor/StudioButton',
  component: StudioButton,
  parameters: {
    componentSubtitle: 'StudioButton',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=3550-14509&node-type=symbol&m=dev'
    }
  },
  argTypes
}

type Story = StoryObj<typeof StudioButton>

const StudioButtonRenderer = (
  args: StudioButtonProps & {
    startIcon?: boolean
    endIcon?: boolean
  }
) => {
  return (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <div className="flex grow flex-col items-center">
          <span className="mb-2 text-sm text-sky-600">{size}</span>
          <StudioButton key={size} size={size} {...args}>
            {args.startIcon && <SquareSm />}
            {args.children}
            {args.endIcon && <SquareSm />}
          </StudioButton>
        </div>
      ))}
    </div>
  )
}

export const Default: Story = {
  name: 'Primary',
  args: {
    children: 'Label',
    variant: 'primary'
  },
  render: StudioButtonRenderer
}

export const Secondary: Story = {
  args: {
    children: 'Label',
    variant: 'secondary'
  },
  render: StudioButtonRenderer
}

export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    children: 'Label',
    variant: 'tertiary'
  },
  render: StudioButtonRenderer
}
