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

import { Rows01Md } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { ArgTypes } from 'storybook/internal/types'
import Select, { OptionType, SelectProps } from './index'

const argTypes: ArgTypes = {
  numberOfListItems: {
    control: 'number',
    name: 'Number of List Items'
  },
  width: {
    control: 'select',
    options: ['sm', 'md', 'lg', 'full']
  },
  inputHeight: {
    control: 'select',
    options: ['xs', 'l', 'xl']
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
  showCheckmark: {
    control: {
      type: 'boolean'
    }
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
  state: {
    control: {
      type: 'select'
    },
    options: ['success', 'error']
  }
}

export default {
  title: 'Primitives/Tailwind/Select',
  component: Select,
  parameters: {
    componentSubtitle: 'Select',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2508-3421&t=XJmPDraRXGrLFAp3-4'
    }
  },
  argTypes,
  args: {
    numberOfListItems: 5
  }
}

const Renderer = ({ numberOfListItems, labelText, labelPosition, generateItem, ...props }) => {
  const items = [] as OptionType[]
  for (let i = 0; i < numberOfListItems; i++) {
    if (generateItem) {
      // @ts-ignore
      items.push(generateItem(i))
    } else {
      items.push({
        value: i,
        label: `Account Settings ${i}`
      })
    }
  }

  const [value, setValue] = React.useState(-1)

  const onChange = (value: number) => {
    setValue(value)
  }

  const [labelProps, setLabelProps] = React.useState(undefined as SelectProps['labelProps'] | undefined)

  useEffect(() => {
    if (labelText && labelPosition) {
      setLabelProps({
        text: labelText,
        position: labelPosition
      })
    } else {
      setLabelProps(undefined)
    }
  }, [labelText, labelPosition])

  return <Select options={items} value={value} onChange={onChange} labelProps={labelProps} {...props} />
}

export const Default = {
  render: Renderer
}

export const SecondaryText = {
  render: Renderer,
  args: {
    generateItem: (i: number) => ({ value: i, label: `Account Settings ${i}`, secondaryText: 'secondary' }),
    showCheckmark: false
  }
}

export const SecondaryTextWithIcon = {
  render: Renderer,
  args: {
    generateItem: (i: number) => ({
      value: i,
      label: `Account Settings ${i}`,
      secondaryText: 'secondary',
      Icon: Rows01Md
    }),
    showCheckmark: false
  }
}
