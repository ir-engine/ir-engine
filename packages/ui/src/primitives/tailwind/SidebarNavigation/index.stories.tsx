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

import { useHookstate } from '@ir-engine/hyperflux'
import React from 'react'
import { User01Lg } from '../../../icons'
import Component from './index'

const argTypes = {
  displayMode: {
    control: 'inline-radio',
    options: ['justify-start', 'justify-between']
  }
}

export default {
  title: 'Primitives/Tailwind/SidebarNavigation',
  component: Component,
  parameters: {
    componentSubtitle: 'SidebarNavigation',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes: argTypes
}

const Renderer = (args) => {
  const currentTabIndex = useHookstate(0)

  const onChange = (tabIndex: number) => {
    currentTabIndex.set(tabIndex)
  }

  return (
    <Component
      labels={args.labels}
      currentTabIndex={currentTabIndex.value}
      onChange={onChange}
      displayMode={args.displayMode}
    />
  )
}

export const Default = {
  args: {
    labels: ['Profile', 'My Account']
  },
  render: Renderer
}

export const WithIcons = {
  args: {
    labels: [
      <>
        <User01Lg className="h-6 w-6" />
        <span>Profile</span>
      </>,
      <>
        <User01Lg className="h-6 w-6" />
        <span>My Account</span>
      </>
    ]
  },
  render: Renderer
}
