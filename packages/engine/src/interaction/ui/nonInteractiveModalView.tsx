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

import { createState } from '@hookstate/core'
import React from 'react'

import { Entity } from '../../ecs/classes/Entity'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { useXRUIState } from '../../xrui/functions/useXRUIState'

export interface ModalState {
  message: string
}

export const createNonInteractiveModalView = (entity: Entity, message: string) => {
  const ui = createXRUI(
    nonInteractiveModalView,
    createState({
      message
    } as ModalState),
    { interactable: false }
  )
  return ui
}

export const nonInteractiveModalView = () => {
  const modalState = useXRUIState<ModalState>()
  return (
    <div className={'modal'}>
      <div className="hint" xr-layer="true" xr-pixel-ratio="1">
        <div>{modalState.message.value}</div>
      </div>
      <link href="https://fonts.googleapis.com/css?family=Lato:400" rel="stylesheet" type="text/css" />
      <style>
        {`
        .modal {
          font-size: 60px;
          background-color: #000d;
          color: white;
          font-family: 'Lato', sans-serif;
          font-weight: 400;
          border: 10px solid white;
          border-radius: 50px;
          padding: 20px;
          margin: 60px;
          width: 400px;
          text-align: center;
        }
      `}
      </style>
    </div>
  )
}
