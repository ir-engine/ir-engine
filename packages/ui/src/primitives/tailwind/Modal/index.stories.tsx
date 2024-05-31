/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'

import Button from '../Button'
import PopupMenu from '../PopupMenu'
import Modal from './index'

const ModelStory = ({ title }) => {
  const onClose = () => {
    PopoverState.hidePopupover()
  }

  const onOpen = () => {
    PopoverState.showPopupover(
      <Modal title={title} onClose={onClose} onSubmit={() => {}}>
        <div className="mb-5 flex flex-col border-b border-[#e5e7eb]">
          <label className="text-secondary">Location</label>
          <input className="fIocus:outline-none rounded-lg px-3.5 py-1.5" type="text" placeholder="Enter here" />

          <label className="text-secondary mt-6">Count</label>
          <input
            className="rounded-lg px-3.5 py-1.5 focus:outline-none"
            value="3"
            type="number"
            placeholder="Enter here"
          />
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <Button onClick={onOpen}>Open Modal</Button>
      <PopupMenu />
    </div>
  )
}

const MultipleModelStory = ({ title }) => {
  const onClose = () => {
    PopoverState.hidePopupover()
  }

  const onSecondPopupOpen = () => {
    PopoverState.showPopupover(
      <Modal title={title} onClose={onClose} onSubmit={() => {}}>
        <div className="mb-5 flex flex-col border-b border-[#e5e7eb]">
          <label className="text-secondary">Location</label>
          <input className="fIocus:outline-none rounded-lg px-3.5 py-1.5" type="text" placeholder="Enter here" />

          <label className="text-secondary mt-6">Count</label>
          <input
            className="rounded-lg px-3.5 py-1.5 focus:outline-none"
            value="3"
            type="number"
            placeholder="Enter here"
          />
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <Button
        onClick={() => {
          PopoverState.showPopupover(
            <Modal title="First Modal" onClose={onClose}>
              <Button onClick={onSecondPopupOpen}>Click to open modal</Button>
            </Modal>
          )
        }}
      >
        Open Modal
      </Button>
      <PopupMenu />
    </div>
  )
}

export default {
  title: 'Primitives/Tailwind/Modal',
  component: ModelStory,
  parameters: {
    componentSubtitle: 'Modal',
    jest: 'Modal.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    title: 'Patch Instance Server'
  }
}

export const Multiple = {
  component: MultipleModelStory,
  args: {
    title: 'Second Modal'
  }
}
