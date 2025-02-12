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

import React, { useEffect, useState } from 'react'
import { ArgTypes } from 'storybook/internal/types'
import RadioGroup, { RadioProps } from './index'

const argTypes: ArgTypes = {
  disabled: {
    control: 'boolean'
  },
  selected: {
    control: 'boolean',
    name: 'Initially selected'
  },
  label: {
    control: 'text'
  },
  description: {
    control: 'text'
  },
  horizontal: {
    control: 'boolean'
  },
  numberOfRadios: {
    control: 'number',
    name: 'Number of Radios',
    description: 'The number of radios to generate'
  },
  variant: {
    control: 'select',
    options: ['sm', 'md']
  }
}

export default {
  title: 'Primitives/Tailwind/Radio',
  component: RadioGroup,
  parameters: {
    componentSubtitle: 'Radio',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2786-21237&node-type=frame&t=n2wfUzH1bzwYsyob-0'
    }
  },
  argTypes,
  args: {
    numberOfRadios: 1,
    variant: 'sm'
  }
}

const RadioGroupRenderer = ({
  description,
  label,
  disabled,
  numberOfRadios,
  horizontal,
  selected,
  variant
}: Pick<RadioProps, 'description' | 'label' | 'disabled' | 'variant'> & {
  numberOfRadios: number
  horizontal: boolean
  selected: boolean
}) => {
  const options =
    numberOfRadios > 1
      ? Array.from({ length: numberOfRadios }, (_, idx) => ({
          label: label && `${label} ${idx + 1}`,
          description: description && `${description} ${idx + 1}`,
          value: `${idx + 1}`
        }))
      : [{ label, description, value: '1' }]

  const [value, setValue] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (selected) {
      setValue(options[0].value)
    }
  }, [selected])

  return (
    <RadioGroup
      variant={variant}
      options={options}
      value={value}
      onChange={(v) => setValue(v)}
      disabled={disabled}
      horizontal={horizontal}
    />
  )
}

export const Default = {
  name: 'Default',
  render: RadioGroupRenderer
}

export const WithDescription = {
  name: 'With Description',
  render: RadioGroupRenderer,
  args: {
    label: 'Remember me',
    description: 'Save my login details for next time'
  }
}
