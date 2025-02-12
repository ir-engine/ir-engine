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
import Seeker, { SeekerProps } from './index'

const argTypes: ArgTypes = {
  currentSeconds: {
    control: 'number',
    name: 'Starting Seconds'
  },
  totalSeconds: {
    control: 'number',
    name: 'Total Seconds'
  },
  isPaused: {
    control: 'boolean',
    name: 'Is Paused'
  }
}

export default {
  title: 'Components/Editor/Seeker',
  component: Seeker,
  parameters: {
    componentSubtitle: 'Seeker',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2283-24252&node-type=frame&t=XAGvEGVnphLHTwP3-0'
    }
  },
  argTypes,
  args: {
    startingSeconds: 40,
    totalSeconds: 9960,
    isPaused: false
  }
}

const SeekerRenderer = (args: SeekerProps & { startingSeconds: number }) => {
  const [currentArgs, updateArgs] = useArgs<{ startingSeconds: number }>()
  return (
    <Seeker
      {...args}
      currentSeconds={currentArgs.startingSeconds}
      onChange={(startingSeconds) => updateArgs({ startingSeconds })}
    />
  )
}

export const Default = {
  name: 'Default',
  render: SeekerRenderer
}
