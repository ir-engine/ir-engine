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

import { ArgTypes } from '@storybook/react'
import React from 'react'
import SegmentedControl, { OptionType } from './index'

const argTypes: ArgTypes = {
  numberOfListItems: {
    control: 'number',
    name: 'Number of List Items'
  },
  layout: {
    control: 'select',
    options: [undefined, 'single-row', 'two-row', 'vertical'],
    name: 'Layout Type'
  }
}

export default {
  title: 'Primitives/Tailwind/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    componentSubtitle: 'SegmentedControl',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/DXwFHGa5g0peqqSjyjpxQz/Studio-Design?node-id=16047-7190&p=f&t=a7fomun8NPlzHEP4-0'
    }
  },
  argTypes,
  args: {
    numberOfListItems: 2,
    layout: undefined
  }
}

const Renderer = ({ numberOfListItems, layout, generateItem, items, ...props }) => {
  const _items = items || ([] as OptionType[])
  for (let i = 0; i < numberOfListItems; i++) {
    if (generateItem) {
      // @ts-ignore
      _items.push(generateItem(i))
    } else if (!items) {
      _items.push({
        value: i,
        label: `Account Settings ${i}`
      })
    }
  }

  const [value, setValue] = React.useState(0)

  const onChange = (value: number) => {
    setValue(value)
  }

  return <SegmentedControl layout={layout} options={_items} value={value} onChange={onChange} {...props} />
}

export const Default = {
  render: Renderer
}
