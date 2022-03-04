import { createState, State, useState } from '@speigg/hookstate'
import React from 'react'

import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../../scene/components/NameComponent'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { InteractableComponent, InteractableComponentType } from '../components/InteractableComponent'
import { InteractiveUI } from '../systems/InteractiveSystem'

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
  InteractiveUI.set(entity, ui)
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
    <div id="interactive-media" xr-layer="true" xr-pixel-ratio="0.5">
      <img
        xr-layer="true"
        src={imageUrl}
        style={{
          width: '100%',
          display: data.type == 'image' ? 'block' : 'none'
        }}
      ></img>
      <video
        id={`interactive-ui-video-${entityIndex}`}
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
        id={`interactive-ui-model-${entityIndex}`}
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
  const url = interactable.interactionUrls?.[0]
  const title = interactable.interactionText
  const description = interactable.interactionDescription

  return (
    <div id={name} className={'interactive-modal ' + modalState.mode.value}>
      <div className="interactive-details" xr-layer="true" xr-pixel-ratio="0.5">
        <div className="interactive-title" xr-layer="true" xr-pixel-ratio="0.8">
          <div>{title.value}</div>
        </div>

        <div className="interactive-e-key" xr-layer="true" xr-pixel-ratio="0.8">
          <div>Press E to Interact</div>
        </div>

        <div className="interactive-flex">
          <div
            className="interactive-description"
            xr-layer="true"
            xr-pixel-ratio="0.9"
            dangerouslySetInnerHTML={{ __html: description.value || '' }}
          ></div>

          <div className="interactive-model" xr-layer="true"></div>
        </div>

        <button
          className="interactive-link"
          xr-layer="true"
          xr-pixel-ratio="2"
          onClick={() => {
            window.open(url.value, '_blank')!.focus()
          }}
        >
          Buy Now
        </button>
      </div>

      {/* <div className="interactive-content"></div> */}

      {/* {renderMedia(detailState)} */}

      <style>
        {`

        .interactive-modal {
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

        .interactive-content {
          display: none;
        }

        .interating .interactive-content {
          display: auto;
        }

        .interactive-link {
          display: ${url ? 'auto' : 'none'};
          position: absolute;
          top: 0;
          left: 30px;
          width: 140px;
          height: 40px;
          border-radius: 20px;
          background-color: white;
          border: none;
          color: rgb(20,20,50,0,1);
          fontSize: 20px;
        }

        .interactive-flex {
          display: flex;
          align-items: flex-start;
          flex-direction: row;
          align-items: stretch;
          height: 300px;
        }

        .interactive-description {
          margin: 0 20px;
          overflow: hidden;
          text-align: left;
          font-size: 10px;
          flex: 1;
        }

        .interactive-model {
          flex: 1;
        }

        .interactive-title {
          overflow: hidden; // contain margin */
          width: 100%;
          box-sizing: border-box;
        }

        .interactive-title div {
          font-size: 15px;
          padding: 20px;
          text-align: center;
          width: 200px;
          margin: 0 auto;
        }

        :is(.inactive, .active) .interactive-title div {
          background-color: #000000dd;
          color: white;
          border: 8px solid white;
          border-radius: 50px;
          box-shadow: #fff2 0 0 20px;
          margin: 20px auto;
        }

        .interactive-e-key {
          position: absolute;
          overflow: hidden; // contain margin
        }

        .interactive-e-key div {
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
        
        .interacting .interactive-e-key {
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
