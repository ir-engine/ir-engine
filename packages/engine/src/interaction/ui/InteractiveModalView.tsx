import React from 'react'
import { createState } from '@hookstate/core'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import Button from '@mui/material/Button'

export function createInteractiveModalView(data: any) {
  return createXRUI(InteractiveModalView, createInteractiveModalState(data))
}

function createInteractiveModalState(data: any) {
  console.log(data)
  return createState({
    title: data.interactionName,
    description: data.interactionDescription,
    images: data.interactionImages,
    videos: data.interactionVideos,
    urls: data.interactionUrls,
    models: data.interactionModels,
    themeIndex: data.interactionThemeIndex,
  })
}

type InteractiveDetailState = ReturnType<typeof createInteractiveModalState>

const refresh = () => {
  debugger;
}

const InteractiveModalView = () => {
  const detailState = useXRUIState() as InteractiveDetailState
  return <div
      style={{
        fontSize: '120px',
        backgroundColor: '#000000dd',
        color: 'white',
        fontFamily: "'Roboto', sans-serif",
        border: '10px solid white',
        borderRadius: '50px',
        padding: '20px',
        margin: '60px',
        boxShadow: '#fff2 0 0 30px',
        width: '2000px',
        height: '4000px',
        textAlign: 'center'
      }}
    >
      <img xr-layer src="https://172.160.10.156:3000/static/laptop/image.jpg" alt="Trulli" width="100%" height="1500px"></img>
      <video
        xr-layer
        id='interactive-ui-3d-viewer'
        style={{
          border: '1px solid white',
          width: '100%',
          height: '1200px'
        }}
      ></video>
      <button
        xr-layer
        style={{
          width: '500px',
          height: '500px',
        }}
        onClick={refresh}
      >
        Send
      </button>
      <div
       xr-layer
       style={{
        width: '100%',
        height: '500px',
        overflow: 'auto'
       }}
      >
        Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS.
      </div>
      {/* <video id='interactive-ui-3d-video' xr-layer controls width="100%" height="auto" autoPlay>
        <source type="video/mp4" src="https://172.160.10.156:3000/static/laptop/video.mp4"></source>
      </video> */}
    </div>
}
