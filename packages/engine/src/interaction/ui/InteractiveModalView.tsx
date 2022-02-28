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
        <div className="interactive-title" xr-layer="true">
          {title.value}
        </div>

        <div
          className="interactive-description"
          xr-layer="true"
          dangerouslySetInnerHTML={{ __html: description.value || '' }}
        ></div>

        <button
          className="interactive-link"
          xr-layer="true"
          xr-pixel-ratio="0.8"
          onClick={() => {
            window.open(url.value, '_blank')!.focus()
          }}
        >
          Open Link
        </button>
      </div>

      {/* {renderMedia(detailState)} */}

      <style>
        {`

        .interactive-modal {
          background-color: #000000dd;
          color: white;
          font-family: 'Roboto', sans-serif;
          border: 10px solid white;
          border-radius: 50px;
          padding: 20px;
          margin: 60px;
          box-shadow: #fff2 0 0 30px;
          width: 500px;
          height: 800px;
        }

        .interactive-description {
          padding: 20px 0;
          overflow: hidden;
          text-align: left;
          font-size: 20px;
          height: 100%;
        }

        .interactive-title {
          font-size: 25px;
          padding: 20px 0px;
          text-align: center;
        }

        .interactive-link {
          display: ${url ? 'auto' : 'none'};
          fontSize: 25px;
          backgroundColor: #000000dd;
          color: white;
        }

        button:hover {
          background-color: darkgrey;
        }

        :is(.inactive, .active) .interactive-title {
          background-color: #000000dd;
          color: white;
          border: 10px solid white;
          border-radius: 50px;
          padding: 20px;
          margin: 60px;
          box-shadow: #fff2 0 0 30px;
        }

      `}
      </style>
    </div>
  )
}
