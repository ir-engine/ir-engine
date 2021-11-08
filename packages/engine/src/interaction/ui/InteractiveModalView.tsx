import React from 'react'
import { createState } from '@hookstate/core'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { NavigateNext, NavigateBefore } from '@mui/icons-material'

let callback: any

export function createInteractiveModalView(data: any) {
  return createXRUI(InteractiveModalView, createInteractiveModalState(data))
}

export function connectCallback(cb: any) {
  callback = cb
}

function createInteractiveModalState(data: any) {
  console.log(data)
  const totalMediaUrls : any[] = [];
  for (let url of data.interactionImages) {
    totalMediaUrls.push({
      type: 'image',
      path: url
    })
  }
  for (let url of data.interactionVideos) {
    totalMediaUrls.push({
      type: 'video',
      path: url
    })
  }
  for (let url of data.interactionModels) {
    totalMediaUrls.push({
      type: 'model',
      path: url
    })
  }
  return createState({
    title: data.interactionName,
    description: data.interactionDescription,
    images: data.interactionImages,
    videos: data.interactionVideos,
    urls: data.interactionUrls,
    models: data.interactionModels,
    themeIndex: data.interactionThemeIndex,
    mediaIndex: data.mediaIndex ? data.mediaIndex : 0,
    totalMediaUrls
  })
}

type InteractiveDetailState = ReturnType<typeof createInteractiveModalState>

const InteractiveModalView = () => {
  const detailState = useXRUIState() as InteractiveDetailState

  const nextClick = () => {
    let value = detailState.mediaIndex.value
    value++
    if (value > detailState.totalMediaUrls.value.length) value = 0
    detailState.mediaIndex.set(value)
    if (callback) callback(detailState)
  }
  
  const beforeClick = () => {
    let value = detailState.mediaIndex.value
    value--
    if (value < 0) value = detailState.totalMediaUrls.value.length - 1
    detailState.mediaIndex.set(value)
    if (callback) callback(detailState)
  }
  
  const linkClick = (urls) => {
    for (let url of urls) {
      window.open(url, '_blank')!.focus();
    }
  }

  const renderMedia = (width, height, position = "relative") => {
    let value = detailState.mediaIndex.value
    if (value < 0) value = detailState.totalMediaUrls.value.length - 1
    if (value >= detailState.totalMediaUrls.value.length) value = 0
    const media = detailState.totalMediaUrls.value[value]
    const data = {
      type: media.type,
      path: media.path
    }
    // https://172.160.10.156:3000/static/laptop/image.jpg
    // https://172.160.10.156:3000/static/laptop/video.mp4

    return <div
      style={{
        width: width,
        height: height,
        position
      }}>
        <img
          xr-layer="true"
          src= {`${data.path}`}
          width= "100%"
          height= "100%"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            objectFit: "cover",
            display: data.type == 'image' ? 'block' : 'none'
          }}
        ></img>
        <video
          id='interactive-ui-video'
          xr-layer="true"
          width= "100%"
          height= "100%"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "100%",
            position: "absolute",
            display: data.type == 'video' ? 'block' : 'none'
          }}
        >
          <source type="video/mp4" src={`${data.path}`}></source>
        </video>
        <div
          id='interactive-ui-model'
          xr-layer="true"
          style={{
            width: "100%",
            height: "1200px",
            position: "absolute",
            display: data.type == 'model' ? 'block' : 'none'
          }}
        >
        </div>
    </div>
  }


  if (detailState.themeIndex.value == '0') {
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
        height: '3200px',
        textAlign: 'center'
      }}
    >
      <div
      style={{
        fontSize: '150px',
        padding: '50px 0px',
        textAlign: 'center'
      }}
      >
        {detailState.title.value}
      </div>
      {renderMedia("100%", "1200px")}
      
      <div
      xr-layer="true"
      style={{
        padding: '50px',
        height: '1000px',
        overflow: 'hidden',
        textAlign: 'left',
        fontSize: '90px',
      }}
      >
        {detailState.description.value}
        {/* Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS.Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS. */}
      </div>
      {
        (detailState.urls.value && detailState.urls.value.length) ? <button
          xr-layer="true"
          style={{
            width: '500px',
            height: '200px',
            fontSize: '90px',
            backgroundColor: '#000000dd',
            color: 'white',
          }}
          onClick={() => {linkClick(detailState.urls.value)}}
        >
          <a>Open Link</a>
        </button> : <></>
      }
      <button
        xr-layer="true"
        style={{
          width: '250px',
          height: '250px',
          position: 'absolute',
          top: '1050px',
          right: '150px',
        }}
        onClick={nextClick}
      >
        <NavigateNext />
      </button>
      <button
        xr-layer="true"
        style={{
          width: '250px',
          height: '250px',
          position: 'absolute',
          top: '1050px',
          left: '150px',
        }}
        onClick={beforeClick}
      >
        <NavigateBefore />
      </button>
    </div>
  } else if (detailState.themeIndex.value == '1') {
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
        width: '3200px',
        height: '2400px',
        textAlign: 'center'
      }}
    >
      <div
       style={{
        fontSize: '150px',
        padding: '50px 0px',
        textAlign: 'center'
       }}
      >
        {detailState.title.value}
      </div>
      {renderMedia("100%", "1200px")}
      
      <div
       xr-layer="true"
       style={{
        padding: '50px',
        height: '500px',
        overflow: 'hidden',
        textAlign: 'left',
        fontSize: '90px',
       }}
      >
        {detailState.description.value}
        {/* Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS.Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS. */}
      </div>
       {
         (detailState.urls.value && detailState.urls.value.length) ? <button
          xr-layer="true"
          style={{
            width: '500px',
            height: '200px',
            fontSize: '90px',
            backgroundColor: '#000000dd',
            color: 'white',
          }}
          onClick={() => {linkClick(detailState.urls.value)}}
        >
          <a>Open Link</a>
        </button> : <></>
       }
      <button
        xr-layer="true"
        style={{
          width: '250px',
          height: '250px',
          position: 'absolute',
          top: '1050px',
          right: '150px',
        }}
        onClick={nextClick}
      >
        <NavigateNext />
      </button>
      <button
        xr-layer="true"
        style={{
          width: '250px',
          height: '250px',
          position: 'absolute',
          top: '1050px',
          left: '150px',
        }}
        onClick={beforeClick}
      >
        <NavigateBefore />
      </button>
    </div>
  } else if (detailState.themeIndex.value == '2') {
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
        width: '4600px',
        height: '1600px',
        textAlign: 'center',
      }}
    >
      <div
       style={{
        fontSize: '150px',
        padding: '50px 0px',
        textAlign: 'center'
       }}
      >
        {detailState.title.value}
      </div>
      <div 
        style={{
          display: 'flex'
        }}>
        {renderMedia("2300px", "1200px", "fixed")}
        <div
        xr-layer="true"
        style={{
          padding: '50px',
          height: '1200px',
          overflow: 'hidden',
          textAlign: 'left',
          fontSize: '90px',
          width: '2200px',
          position: 'absolute',
          right: '50px'
        }}
        >
          {detailState.description.value}
          {/* Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS.Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS. */}
        </div>
      </div>
       {
         (detailState.urls.value && detailState.urls.value.length) ? <button
          xr-layer="true"
          style={{
            width: '500px',
            height: '200px',
            fontSize: '90px',
            backgroundColor: '#000000dd',
            color: 'white',
            position: 'absolute',
            bottom: '200px',
            right: '200px'
          }}
          onClick={() => {linkClick(detailState.urls.value)}}
        >
          <a>Open Link</a>
        </button> : <></>
       }
      <button
        xr-layer="true"
        style={{
          width: '250px',
          height: '250px',
          position: 'absolute',
          top: '850px',
          left: '2050px',
        }}
        onClick={nextClick}
      >
        <NavigateNext />
      </button>
      <button
        xr-layer="true"
        style={{
          width: '250px',
          height: '250px',
          position: 'absolute',
          top: '850px',
          left: '150px',
        }}
        onClick={beforeClick}
      >
        <NavigateBefore />
      </button>
    </div>
  } else {
    return <></>
  }
  
  
}
