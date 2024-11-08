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

import { useArgs } from '@storybook/preview-api'
import React from 'react'
import { ArgTypes } from 'storybook/internal/types'
import Checkbox, { CheckboxProps } from './index'

const argTypes: ArgTypes = {
  checked: {
    control: 'boolean'
  },
  disabled: {
    control: 'boolean'
  },
  indeterminate: {
    control: 'boolean'
  },
  label: {
    control: 'text',
    if: { arg: 'label', exists: true }
  },
  description: {
    control: 'text',
    if: { arg: 'description', exists: true }
  },
  variantSize: {
    name: 'size',
    control: 'inline-radio',
    options: ['md', 'lg']
  },
  variantTextPlacement: {
    name: 'Text Placement',
    control: 'inline-radio',
    options: ['left', 'right']
  }
}

export default {
  title: 'Primitives/Tailwind/Checkbox',
  component: Checkbox,
  parameters: {
    componentSubtitle: 'Checkbox',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2786-21102&node-type=frame&t=TlQtKBH49KjD5Efr-0'
    }
  },
  argTypes,
  args: {
    variantSize: 'md',
    variantTextPlacement: 'right'
  }
}

const CheckboxRenderer = (args: CheckboxProps) => {
  const [, updateArgs] = useArgs<{ checked: boolean }>()

  return (
    <div className="flex items-center gap-3">
      <Checkbox {...args} onChange={(checked) => updateArgs({ checked })} />
    </div>
  )
}

export const Default = {
  name: 'Default',
  render: CheckboxRenderer
}

export const WithLabel = {
  name: 'With Label',
  render: CheckboxRenderer,
  args: {
    label: 'Checkbox label'
  }
}

export const WithDescription = {
  name: 'With Description',
  render: CheckboxRenderer,
  args: {
    label: 'Checkbox label',
    description: 'Save my login details for next time.'
  }
}
