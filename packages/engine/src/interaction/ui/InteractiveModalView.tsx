import { createState } from '@hookstate/core'
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
