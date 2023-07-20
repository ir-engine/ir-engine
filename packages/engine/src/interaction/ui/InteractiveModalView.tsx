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

import { hookstate } from '@etherealengine/hyperflux'
import React from 'react'

import { Entity } from '../../ecs/classes/Entity'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { useXRUIState } from '../../xrui/functions/useXRUIState'

export interface InteractiveModalState {
  interactMessage: string
}

export const createInteractiveModalView = (entity: Entity, interactMessage: string) => {
  return createXRUI(
    InteractiveModalView,
    hookstate({
      interactMessage
    } as InteractiveModalState)
  )
}

export const InteractiveModalView = () => {
  const modalState = useXRUIState<InteractiveModalState>()
  return (
    <div className={'modal'}>
      <div className="hint" xr-layer="true" xr-pixel-ratio="1">
        <div>{modalState.interactMessage.value}</div>
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
          box-shadow: #fff2 0 0 30px;
          width: 400px;
          text-align: center;
        }
      `}
      </style>
    </div>
  )
}
