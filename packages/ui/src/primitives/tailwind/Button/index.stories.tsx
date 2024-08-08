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
import { ArgTypes, StoryObj } from '@storybook/react'
import React from 'react'
import { IoAddOutline, IoSend } from 'react-icons/io5'

import Button, { ButtonProps } from './index'

const sizes: ButtonProps['size'][] = ['xs', 'sm', 'l', 'xl']

const argTypes: ArgTypes = {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline', 'danger', 'success', 'transparent', 'sidebar']
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
    },
    controls: {
      include: ['children', 'variant']
    }
  },
  argTypes
}

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Submit'
  },
  render: (args) => {
    return (
      <div className="flex items-center gap-3">
        {sizes.map((size) => (
          <Button key={size} size={size} {...args} />
        ))}
      </div>
    )
  }
}

export const WithStartIcon = {
  args: {
    children: 'Submit',
    startIcon: <IoAddOutline />
  }
}

export const WithEndIcon = {
  args: {
    children: 'Send',
    endIcon: <IoSend />
  }
}
