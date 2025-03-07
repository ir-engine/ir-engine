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
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import Button from '../Button'
import Input from '../Input'
import Accordion from './index'

export default {
  title: 'Primitives/Tailwind/Accordion',
  component: Accordion,
  parameters: {
    componentSubtitle: 'Accordion',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    title: 'Task Server',
    subtitle: 'Edit App Title, Subtitle, PWA, Logo, Icon, Release Name, Audio and Video codec',
    expandIcon: <HiPlusSmall />,
    shrinkIcon: <HiMinus />,
    children: (
      <>
        <div className="my-6 flex w-full justify-between gap-4">
          <Input
            labelProps={{
              text: 'Port',
              position: 'top'
            }}
            value="3030"
          />
          <Input
            labelProps={{
              text: 'Process Interval',
              position: 'top'
            }}
            value="30"
          />
        </div>
        <div className="flex w-3/12 justify-between gap-4">
          <Button fullWidth className="bg-theme-highlight">
            Cancel
          </Button>
          <Button fullWidth variant="primary">
            Submit
          </Button>
        </div>
      </>
    )
  }
}
