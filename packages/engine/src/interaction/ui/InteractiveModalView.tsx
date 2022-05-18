import { createState, State, useState } from '@speigg/hookstate'
import React from 'react'

import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

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
  const url = interactable.interactionUrls?.[0]
  const title = interactable.interactionText
  const description = interactable.interactionDescription

  return (
    <div id={name} className={'modal ' + modalState.mode.value}>
      <div className="title" xr-layer="true" xr-pixel-ratio="1">
        <div>{title.value}</div>
      </div>

      <div className="hint" xr-layer="true" xr-pixel-ratio="1">
        <div>Press E to Interact</div>
      </div>

      <div className="flex">
        <div
          className="description"
          xr-layer="true"
          xr-pixel-ratio="1"
          dangerouslySetInnerHTML={{ __html: description.value || '' }}
        ></div>

        <div className="model" xr-layer="true"></div>
      </div>

      <button
        className="link"
        xr-layer="true"
        xr-pixel-ratio="1.5"
        onClick={() => {
          window.open(url.value, '_blank')!.focus()
        }}
      >
        Buy Now
      </button>

      <div className="rating">
        <span xr-layer="true" className="star-1">
          ★
        </span>
        <span xr-layer="true" className="star-2">
          ★
        </span>
        <span xr-layer="true" className="star-3">
          ★
        </span>
        <span xr-layer="true" className="star-4">
          ★
        </span>
        <span xr-layer="true" className="star-5">
          ☆
        </span>
      </div>

      {/* <div className="content"></div> */}

      {/* {renderMedia(detailState)} */}

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

        .link {
          display: ${url ? 'auto' : 'none'};
          position: absolute;
          top: 30px;
          left: 30px;
          width: 140px;
          height: 40px;
          border-radius: 20px;
          background-color: white;
          border: none;
          color: rgb(20,20,50,0,1);
          fontSize: 20px;
        }

        .flex {
          display: flex;
          align-items: flex-start;
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

        .model {
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

        .rating {
          position: absolute;
          top: 30px;
          right: 30px;
          font-size: 28px;
        }

      `}
      </style>
    </div>
  )
}
