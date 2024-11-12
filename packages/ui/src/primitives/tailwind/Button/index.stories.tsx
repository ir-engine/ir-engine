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

import { HiOutlineMail } from 'react-icons/hi'
import Button, { ButtonProps } from './index'

const sizes: ButtonProps['size'][] = ['xs', 'sm', 'l', 'xl']

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
  }
}

export default {
  title: 'Primitives/Tailwind/Button',
  component: Button,
  parameters: {
    componentSubtitle: 'Button',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2035-16950'
    }
  },
  argTypes
}

type Story = StoryObj<typeof Button>

const ButtonRenderer = (
  args: ButtonProps & {
    startIcon?: boolean
    endIcon?: boolean
  }
) => {
  return (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <div className="flex grow flex-col items-center">
          <span className="mb-2 text-sm text-blue-400">{size}</span>
          <Button key={size} size={size} {...args}>
            {args.startIcon && <HiOutlineMail />}
            {args.children}
            {args.endIcon && <HiOutlineMail />}
          </Button>
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
  render: ButtonRenderer
}

export const Secondary: Story = {
  args: {
    children: 'Label',
    variant: 'secondary'
  },
  render: ButtonRenderer
}

export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    children: 'Label',
    variant: 'tertiary'
  },
  render: ButtonRenderer
}

export const Green: Story = {
  args: {
    children: 'Label',
    variant: 'green'
  },
  render: ButtonRenderer
}

export const Red: Story = {
  args: {
    children: 'Label',
    variant: 'red'
  },
  render: ButtonRenderer
}
