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

import React from 'react'
import { HiMiniRocketLaunch } from 'react-icons/hi2'
import { DropdownItem, DropdownItemProps } from './index'

export default {
  title: 'Components/Editor/DropdownList',
  parameters: {
    componentSubtitle: 'Dropdown',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2511-3503&node-type=frame&t=B0cD28zTLRN51Vxd-0'
    }
  }
}

const DropdownItemRenderer = (args: DropdownItemProps) => {
  let Icon: (() => JSX.Element) | undefined = undefined
  if (!args.Icon) {
    Icon = HiMiniRocketLaunch as () => JSX.Element
    delete args.Icon
  }
  return <DropdownItem Icon={Icon} {...args} />
}

export const DropdownItemStory = {
  name: 'Dropdown Item',
  render: DropdownItemRenderer,
  args: {
    title: 'Account settings'
  },
  argTypes: {
    secondaryText: {
      control: 'text'
    }
  }
}
