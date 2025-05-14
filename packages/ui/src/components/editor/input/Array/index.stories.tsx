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

import React, { ReactNode } from 'react'
import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Array',
  component: Component,
  parameters: {
    componentSubtitle: 'ArrayInput',
    jest: 'Array.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    label: 'Source Path',
    containerClassName: 'w-96',
    values: ['test name 1', 'test value 2', 'test 3', 'test 4'],
    inputLabel: 'Path',
    onChange: () => {}
  }
}

export const CustomerRender = {
  args: {
    label: 'Source Path',
    containerClassName: 'w-96',
    values: [
      <span className="mr-2 text-sm text-gray-500">test name 1</span>,
      <span className="mr-2 text-sm text-gray-500">test value 2</span>,
      <span className="mr-2 text-sm text-gray-500">test 3</span>,
      <span className="mr-2 text-sm text-gray-500">test 4</span>
    ],
    inputLabel: 'Path',
    onChange: () => {},
    renderFunction: (value: ReactNode) => {
      return (
        <div className="flex w-full items-center justify-between">
          {value}
          <button className="rounded bg-blue-500 px-2 py-1 text-white">Click Me</button>
        </div>
      )
    }
  }
}
