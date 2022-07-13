import { createState, useState } from '@speigg/hookstate'
import React from 'react'

import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { dispatchAction } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../../scene/components/NameComponent'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { InteractableComponent } from '../components/InteractableComponent'

export interface InteractiveModalState {
  mode: 'inactive' | 'active' | 'interacting'
  entity: Entity
}

export const createInteractiveModalView = (entity: Entity) => {
  const ui = createXRUI(
    InteractiveModalView,
    createState({
      mode: 'inactive',
      entity
    } as InteractiveModalState)
  )
  return ui
}

const renderMedia = (detailState) => {
  let value = detailState.mediaIndex.value
  let entityIndex = detailState.entityIndex.value
  if (value < 0) value = detailState.totalMediaUrls.value.length - 1
  if (value >= detailState.totalMediaUrls.value.length) value = 0
  const media = detailState.totalMediaUrls.value[value]

  if (!media) return
  const data = {
    type: media.type,
    path: media.path
  }

  let imageUrl = ''
  if (data.type == 'image') {
    imageUrl = media.path
  }

  return (
    <div id="media" xr-layer="true" xr-pixel-ratio="0.5">
      <img
        xr-layer="true"
        src={imageUrl}
        style={{
          width: '100%',
          display: data.type == 'image' ? 'block' : 'none'
        }}
      ></img>
      <video
        id={`ui-video-${entityIndex}`}
        width="100%"
        height="100%"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '100%',
          display: data.type == 'video' ? 'block' : 'none'
        }}
      ></video>
      <div
        xr-layer="true"
        id={`ui-model-${entityIndex}`}
        style={{
          width: '100%',
          height: '300px',
          display: data.type == 'model' ? 'block' : 'none'
        }}
      ></div>
    </div>
  )
}

export const InteractiveModalView = () => {
  const modalState = useXRUIState<InteractiveModalState>()
  const entity = modalState.entity.value
  const name = getComponent(entity, NameComponent)?.name
  const interactable = useState(getComponent(entity, InteractableComponent))
  const title = interactable.interactionText

  return (
    <div id={name} className={'modal ' + modalState.mode.value}>
      <div className="title" xr-layer="true" xr-pixel-ratio="1">
        <div>{title.value}</div>
      </div>

      <div className="hint" xr-layer="true" xr-pixel-ratio="1">
        <div>Press E to Interact</div>
      </div>

      {renderMedia(modalState)}

      <style>
        {`

        .modal {
          background-color: rgb(20,20,50,0.9);
          color: white;
          font-family: 'Roboto', sans-serif;
          border: 0.5px solid white;
          border-radius: 40px;
          // box-shadow: #fff2 0 0 20px;
          width: ${162 * 4}px;
          height: ${100 * 4}px;
          margin:1px;
        }

        .content {
          display: none;
        }

        .interating .content {
          display: auto;
        }

        .flex {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          height: 300px;
        }

        .description {
          margin: 0 20px;
          overflow: hidden;
          text-align: left;
          font-size: 10px;
          flex: 1;
        }

        .title {
          overflow: hidden; // contain margin */
          width: 100%;
          box-sizing: border-box;
        }

        .title div {
          font-size: 18px;
          padding: 25px;
          text-align: center;
          width: 200px;
          margin: 0 auto;
        }

        :is(.inactive, .active) .title div {
          background-color: #000000dd;
          color: white;
          border: 8px solid white;
          border-radius: 50px;
          box-shadow: #fff2 0 0 20px;
          margin: 20px auto;
        }
        span[class^="star-"]{
          background-image: linear-gradient(to bottom, #FFFFEB 0%, #FFF9B0 45%, #E49E15 75%);
          -webkit-background-clip: text;
          color:transparent;
        }
        .hint {
          position: absolute;
          overflow: hidden; // contain margin
        }

        .hint div {
          fontSize: 15px;
          border-radius: 40px;
          padding: 20px;
          color: white;
          background-color: #333333dd;
          text-align: center;
          margin: 0 auto;
          font-weight: bolder;
          width: 160px;
        }
        
        .interacting .hint {
          display: none
        }

        button:hover {
          background-color: darkgrey;
        }

      `}
      </style>
    </div>
  )
}
