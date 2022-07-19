import { createState } from '@speigg/hookstate'
import React from 'react'

import { Entity } from '../../ecs/classes/Entity'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { useXRUIState } from '../../xrui/functions/useXRUIState'

export interface InteractiveModalState {
  interactMessage: string
}

export const createInteractiveModalView = (entity: Entity, interactMessage: string) => {
  const ui = createXRUI(
    InteractiveModalView,
    createState({
      interactMessage
    } as InteractiveModalState)
  )
  return ui
}

export const InteractiveModalView = () => {
  const modalState = useXRUIState<InteractiveModalState>()
  return (
    <div className={'modal'}>
      <div className="hint" xr-layer="true" xr-pixel-ratio="1">
        <div>{modalState.interactMessage.value}</div>
      </div>
      <style>
        {`
        .modal {
          background-color: rgb(20,20,50,0.9);
          color: white;
          font-family: 'Roboto', sans-serif;
          border: 0.5px solid white;
          border-radius: 40px;
          width: ${162 * 4}px;
          height: ${100 * 4}px;
          margin:1px;
        }
      `}
      </style>
    </div>
  )
}
