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

import React, { useState } from 'react'

import Button from '../Button'
import Modal from './index'

const ModelStory = ({ title }) => {
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <h1>Title</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ex pariatur nisi quasi sit, illum cum repellendus
        minima omnis modi nostrum corrupti laboriosam soluta eos quas quidem, nulla quos quam?
      </p>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vero officiis, quaerat provident sunt, iure, deleniti
        eligendi reiciendis aspernatur cumque fuga nam! Facilis fuga adipisci saepe enim vero sit quaerat amet.
      </p>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dignissimos neque possimus in eos ullam aliquid
        debitis ex libero! Qui eveniet repellat officia laudantium animi ad aspernatur voluptatum enim tenetur a?
      </p>
      <Modal title={title} open={open} onClose={onClose}>
        <div className="flex flex-col mb-5 border-b border-[#e5e7eb]">
          <label className="text-secondary">Location</label>
          <input className="rounded-lg fIocus:outline-none px-3.5 py-1.5" type="text" placeholder="Enter here" />

          <label className="text-secondary mt-6">Count</label>
          <input
            className="rounded-lg focus:outline-none px-3.5 py-1.5"
            value="3"
            type="number"
            placeholder="Enter here"
          />
        </div>
        <div className="flex justify-between mt-5">
          <Button size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" onClick={onClose}>
            Submit
          </Button>
        </div>
      </Modal>
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
