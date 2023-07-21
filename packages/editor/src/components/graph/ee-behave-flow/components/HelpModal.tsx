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

import React, { FC } from 'react'

import { Modal } from './Modal'

export type HelpModalProps = {
  open?: boolean
  onClose: () => void
}

export const HelpModal: FC<HelpModalProps> = ({ open = false, onClose }) => {
  return (
    <Modal title="Help" actions={[{ label: 'Close', onClick: onClose }]} open={open} onClose={onClose}>
      <p className="mb-2">Right click anywhere to add a new node.</p>
      <p className="mb-2">Drag a connection into empty space to add a new node and connect it to the source.</p>
      <p className="mb-2">Click and drag on a socket to connect to another socket of the same type.</p>
      <p>Left click to select nodes or connections, backspace to delete selected nodes or connections.</p>
    </Modal>
  )
}
