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

import { Globe01Sm, HelpIconSm } from '@ir-engine/ui/src/icons'
import { ArgTypes, StoryFn } from '@storybook/react'
import React from 'react'
import Input, { InputProps } from './index'

const sizes: InputProps['height'][] = ['xs', 'l', 'xl']

const argTypes: ArgTypes = {
  size: {
    control: {
      type: 'select'
    },
    options: sizes
  },
  fullWidth: {
    control: {
      type: 'boolean'
    }
  },
  state: {
    control: {
      type: 'select'
    },
    options: ['success', 'error']
  },
  disabled: {
    control: {
      type: 'boolean'
    }
  },
  helperText: {
    control: {
      type: 'text'
    }
  },
  labelText: {
    control: {
      type: 'text'
    }
  },
  labelPosition: {
    control: {
      type: 'select'
    },
    options: ['top', 'left']
  },
  infoText: {
    control: {
      type: 'text'
    }
  },
  required: {
    control: {
      type: 'boolean'
    }
  }
}

export default {
  title: 'Primitives/Tailwind/Input',
  component: Input,
  parameters: {
    componentSubtitle: 'Input',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2105-17763'
    }
  },
  argTypes: argTypes
}

const Template: StoryFn = (args) => {
  // @ts-ignore
  const updatedArgs: InputProps = {
    ...args,
    labelProps: {
      text: args.labelText,
      position: args.labelPosition,
      infoText: args.infoText
    }
  }
  return (
    <div className="grid h-[50vh] w-full place-items-center rounded border border-gray-300 p-5">
      <Input {...updatedArgs} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  size: 'l'
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  value: 'ir@infinityreality.com',
  fullWidth: true,
  placeholder: 'Email Address',
  size: 'l'
}

export const InputWithLeadingIcon = Template.bind({})
InputWithLeadingIcon.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  startComponent: <Globe01Sm />,
  size: 'l'
}

export const InputWithTrailingIcon = Template.bind({})
InputWithTrailingIcon.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  endComponent: (
    <button>
      <HelpIconSm />
    </button>
  ),
  size: 'l'
}

export const InputWithBothIcons = Template.bind({})
InputWithBothIcons.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  startComponent: <Globe01Sm />,
  endComponent: (
    <button>
      <HelpIconSm />
    </button>
  ),
  size: 'l'
}
