import React from 'react'
import { createState } from '@hookstate/core'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { NavigateNext, NavigateBefore } from '@mui/icons-material'
import { InteractionData } from '@xrengine/engine/src/interaction/types/InteractionTypes'

export function createInteractiveModalView(data: InteractionData) {
  return createXRUI(
    () => <InteractiveModalView callback={data.callback}></InteractiveModalView>,
    createInteractiveModalState(data)
  )
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
    <div id="interactable-media">
      <img
        src={imageUrl}
        style={{
          width: '100%'
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
          display: data.type == 'model' ? 'block' : 'none'
        }}
      ></div>
    </div>
  )
}

function createInteractiveModalState(data: InteractionData) {
  const totalMediaUrls: any[] = []
  if (data.interactionImages)
    for (let url of data.interactionImages) {
      totalMediaUrls.push({
        type: 'image',
        path: url
      })
    }
  if (data.interactionVideos)
    for (let url of data.interactionVideos) {
      totalMediaUrls.push({
        type: 'video',
        path: url
      })
    }
  if (data.interactionModels)
    for (let url of data.interactionModels) {
      totalMediaUrls.push({
        type: 'model',
        path: url
      })
    }
  let entityIndex = 0
  if (data.interactionUserData && data.interactionUserData.entity) {
    entityIndex = data.interactionUserData.entity
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
    entityIndex,
    totalMediaUrls
  })
}

type InteractiveDetailState = ReturnType<typeof createInteractiveModalState>

const InteractiveModalView = (props) => {
  const detailState = useXRUIState() as InteractiveDetailState

  const nextClick = () => {
    let value = detailState.mediaIndex.value
    value++
    if (value > detailState.totalMediaUrls.value.length) value = 0
    detailState.mediaIndex.set(value)
    if (props && props.callback) {
      props.callback({
        mediaIndex: value,
        mediaData: detailState.totalMediaUrls.value,
        entityIndex: detailState.entityIndex.value
      })
    }
  }

  const beforeClick = () => {
    let value = detailState.mediaIndex.value
    value--
    if (value < 0) value = detailState.totalMediaUrls.value.length - 1
    detailState.mediaIndex.set(value)
    if (props && props.callback) {
      props.callback({
        mediaIndex: value,
        mediaData: detailState.totalMediaUrls.value,
        entityIndex: detailState.entityIndex.value
      })
    }
  }

  const linkClick = (urls) => {
    for (let url of urls) {
      window.open(url, '_blank')!.focus()
    }
  }

  if (detailState.themeIndex.value?.toString() == '1') {
    return (
      <div
        style={{
          backgroundColor: '#000000dd',
          color: 'white',
          fontFamily: "'Roboto', sans-serif",
          border: '10px solid white',
          borderRadius: '50px',
          padding: '20px',
          margin: '60px',
          boxShadow: '#fff2 0 0 30px',
          width: '800px',
          height: '600px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            padding: '50px 0px',
            textAlign: 'center'
          }}
        >
          {detailState.title.value}
        </div>
        {renderMedia(detailState)}

        <div
          style={{
            padding: '10px',
            overflow: 'hidden',
            textAlign: 'left',
            fontSize: '18px'
          }}
        >
          {detailState.description.value}
          {/* Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS.Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS. */}
        </div>
        {detailState.urls.value && detailState.urls.value.length ? (
          <button
            xr-layer="true"
            style={{
              fontSize: '90px',
              backgroundColor: '#000000dd',
              color: 'white',
              borderRadius: '10px'
            }}
            onClick={() => {
              linkClick(detailState.urls.value)
            }}
          >
            <a>Open Link</a>
          </button>
        ) : (
          <></>
        )}
        <button
          xr-layer="true"
          style={{
            width: '250px',
            height: '250px',
            position: 'absolute',
            top: '1050px',
            right: '150px'
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
            left: '150px'
          }}
          onClick={beforeClick}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
          button:hover {
            border: 10px solid red;
          }
        `
            }}
          ></style>
          <NavigateBefore />
        </button>
      </div>
    )
  } else if (detailState.themeIndex.value?.toString() == '2') {
    return (
      <div
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
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontSize: '150px',
            padding: '50px 0px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          {detailState.title.value}
        </div>
        <div
          style={{
            display: 'flex'
          }}
        >
          {renderMedia(detailState)}
          <div
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
        {detailState.urls.value && detailState.urls.value.length ? (
          <button
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
            onClick={() => {
              linkClick(detailState.urls.value)
            }}
          >
            <a>Open Link</a>
          </button>
        ) : (
          <></>
        )}
        <button
          xr-layer="true"
          style={{
            width: '250px',
            height: '250px',
            position: 'absolute',
            top: '850px',
            left: '2050px'
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
            left: '150px'
          }}
          onClick={beforeClick}
        >
          <NavigateBefore />
        </button>
        <style>{`
          button:hover {
            border: 10px solid red;
          }
        `}</style>
      </div>
    )
  } else {
    return (
      <div
        style={{
          backgroundColor: '#000000dd',
          color: 'white',
          fontFamily: "'Roboto', sans-serif",
          border: '10px solid white',
          borderRadius: '50px',
          padding: '20px',
          margin: '60px',
          boxShadow: '#fff2 0 0 30px',
          width: '500px',
          height: '800px'
        }}
      >
        <div
          style={{
            fontSize: '25px',
            padding: '20px 0px',
            textAlign: 'center'
          }}
        >
          {detailState.title.value}
        </div>
        {renderMedia(detailState)}

        <div
          style={{
            padding: '20px 0',
            overflow: 'hidden',
            textAlign: 'left',
            fontSize: '20px'
          }}
        >
          {detailState.description.value}
          {/* Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS.Extend your battlefield prowess with the ROG Strix Scope Deluxe gaming keyboard featuring an ergonomic wrist rest to keep you comfortable through those marathon gaming sessions. From ASUS. */}
        </div>
        {detailState.urls.value && detailState.urls.value.length ? (
          <button
            xr-layer="true"
            style={{
              fontSize: '25px',
              backgroundColor: '#000000dd',
              color: 'white'
            }}
            onClick={() => {
              linkClick(detailState.urls.value)
            }}
          >
            <a>Open Link</a>
          </button>
        ) : (
          <></>
        )}
        <button
          xr-layer="true"
          style={{
            width: '15%',
            fontSize: '25px',
            position: 'absolute',
            bottom: '0',
            right: '150px',
            borderRadius: '20px'
          }}
          onClick={nextClick}
        >
          <NavigateNext />
        </button>
        <button
          xr-layer="true"
          style={{
            width: '15%',
            fontSize: '25px',
            position: 'absolute',
            bottom: '0',
            left: '150px',
            borderRadius: '20px'
          }}
          onClick={beforeClick}
        >
          <NavigateBefore />
        </button>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          button:hover {
            background-color: darkgrey;
          }
        `
          }}
        ></style>
      </div>
    )
  }
}
