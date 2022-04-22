import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { AvatarStates } from '@xrengine/engine/src/avatar/animation/Util'
import { changeAvatarAnimationState } from '@xrengine/engine/src/avatar/animation/Util'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI, XRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { NavigateBefore, NavigateNext } from '@mui/icons-material'
import Button from '@mui/material/Button'

const styles = {}

export function createEmoteDetailView() {
  return createXRUI(EmoteDetailView, createEmoteDetailState())
}

function createEmoteDetailState() {
  return createState({
    emoteWindowOpen: false
  })
}

type EmoteDetailState = ReturnType<typeof createEmoteDetailState>

const EmoteDetailView = () => {
  const detailState = useXRUIState() as EmoteDetailState

  const MAX_EMOTE_PER_PAGE = 6
  const MIN_EMOTE_PER_PAGE = 5

  const getEmotePerPage = () => (window.innerWidth > 768 ? MAX_EMOTE_PER_PAGE : MIN_EMOTE_PER_PAGE)
  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getEmotePerPage())

  let [menuRadius, setMenuRadius] = useState(window.innerWidth > 360 ? 182 : 150)

  let menuPadding = window.innerWidth > 360 ? 25 : 20
  let menuThickness = menuRadius > 170 ? 70 : 60
  let menuItemWidth = menuThickness - menuPadding
  let menuItemRadius = menuItemWidth / 2
  let effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2

  let [items, setItems] = useState([
    {
      body: (
        <img src="/static/grinning.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Dance 4" />
      ),
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE4)
      }
    },
    {
      body: <img src="/static/sad.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="sad" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.CLAP)
      }
    },
    {
      body: <img src="/static/Kiss.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Kiss" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.KISS)
      }
    },
    {
      body: <img src="/static/Cry.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Cry" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.CRY)
      }
    },
    {
      body: (
        <img src="/static/dance_new1.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Dance 1" />
      ),
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE1)
      }
    },
    {
      body: <img src="/static/clap1.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Dance 2" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE2)
      }
    },
    {
      body: <img src="/static/victory.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Dance 3" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE3)
      }
    },
    {
      body: <img src="/static/Laugh.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Laugh" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LAUGH)
      }
    },
    {
      body: <img src="/static/Defeat.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Defeat" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DEFEAT)
      }
    },
    {
      body: <img src="/static/Wave.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} alt="Wave" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.WAVE)
      }
    },
    {
      body: <img src="/static/restart.svg" style={{ opacity: '0.8', display: 'block', width: '100%' }} />,
      containerProps: {
        //onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.IDLE })
      }
    }
  ])

  const calculateMenuRadius = () => {
    setImgPerPage(getEmotePerPage())
    setMenuRadius(window.innerWidth > 360 ? 182 : 150)
    calculateOtherValues()
  }

  useEffect(() => {
    window.addEventListener('resize', calculateMenuRadius)
    calculateOtherValues()
  }, [])

  const calculateOtherValues = (): void => {
    menuThickness = menuRadius > 170 ? 70 : 60
    menuItemWidth = menuThickness - menuPadding
    menuItemRadius = menuItemWidth / 2
    effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2
  }

  const runAnimation = (stateName: string) => {
    const entity = Engine.currentWorld.localClientEntity
    changeAvatarAnimationState(entity, stateName)
    // close Menu after playing animation
    //props.changeActiveMenu(null)
  }

  const renderEmoteList = () => {
    const itemList = [] as JSX.Element[]
    const startIndex = page * imgPerPage
    const endIndex = Math.min(startIndex + imgPerPage, items.length)
    let angle = 360 / imgPerPage
    let index = 0
    let itemAngle = 0
    let x = 0
    let y = 0

    for (let i = startIndex; i < endIndex; i++, index++) {
      const emoticon = items[i]
      itemAngle = angle * index + 270
      x = effectiveRadius * Math.cos((itemAngle * Math.PI) / 280)
      y = effectiveRadius * Math.sin((itemAngle * Math.PI) / 280)

      itemList.push(
        <div key={i}>
          <Button
            {...emoticon.containerProps}
            style={{
              width: menuItemWidth,
              height: menuItemWidth,
              transform: `translate(${x}px , ${y}px)`,
              borderRadius: '50%',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              margin: '0',
              padding: '0',
              minWidth: '0',
              backgroundColor: 'transparent',
              border: 'none'
            }}
          >
            {emoticon.body}
          </Button>
        </div>
      )
    }

    return (
      <div
        style={{
          width: menuItemRadius,
          height: menuItemRadius,
          position: 'relative'
        }}
      >
        {itemList}
      </div>
    )
  }

  const loadNextEmotes = (e) => {
    e.preventDefault()
    if ((page + 1) * imgPerPage >= items.length) return
    setPage(page + 1)
  }
  const loadPreviousEmotes = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  return (
    <section
      style={{
        position: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          display: 'flex',

          borderRadius: '50%',
          border: 'solid 100px rgba(51, 51, 110, 0.5)',
          borderBottomColor: 'transparent',
          opacity: '0.9',

          width: '361.4px !important',
          height: '361.4px !important',
          borderWidth: '70px !important'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '70px',
            position: 'absolute',
            left: '2px',
            top: '192.7px',
            backgroundColor: 'rgb(51, 51, 110, 0.5)',
            transform: 'rotate(-45deg)',
            borderTopRightRadius: '50px',
            borderBottomRightRadius: '50px',
            opacity: '1'
          }}
        >
          <button
            xr-layer=""
            type="button"
            style={{
              position: 'relative',
              border: 'none',
              padding: '0',
              backgroundColor: 'transparent',
              top: '18px',
              right: '3px',
              transform: 'rotate(50deg)',
              ...(page === 0 ? { color: '#c3c3c3', cursor: 'initial' } : { color: '#ffffff' })
            }}
            onClick={loadPreviousEmotes}
          >
            <svg
              style={{
                position: 'relative',
                zIndex: '1',
                fontSize: '30px',
                userSelect: 'none',
                width: '1em',
                height: '1em',
                display: 'inline-block',
                fill: 'currentColor',
                flexShrink: '0'
              }}
              focusable="false"
              aria-hidden="true"
              viewBox="0 0 24 24"
              data-testid="NavigateBeforeIcon"
            >
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </button>
        </div>

        {renderEmoteList()}

        <div
          style={{
            content: '',
            width: '40px',
            height: '70px',
            position: 'absolute',
            right: '2px',
            top: '192.7px',
            backgroundColor: 'rgb(51 51 110 / 50%)',
            transform: 'rotate(240deg)',
            borderTopRightRadius: '50px',
            borderBottomRightRadius: '50px',
            opacity: '1'
          }}
        >
          <button
            xr-layer=""
            type="button"
            style={{
              position: 'relative',
              border: 'none',
              padding: '0',
              top: '18px',
              right: '3px',
              backgroundColor: 'transparent',
              transform: 'rotate(120deg)',
              ...((page + 1) * imgPerPage >= items.length
                ? { color: '#c3c3c3', cursor: 'initial' }
                : { color: '#ffffff' })
            }}
            onClick={loadNextEmotes}
          >
            <svg
              style={{
                position: 'relative',
                fontSize: '30px',
                userSelect: 'none',
                width: '1em',
                height: '1em',
                display: 'inline-block',
                fill: 'currentColor',
                flexShrink: '0',
                transition: 'fill 200ms cubic-bezier(0.4,0,0.2,1) 0ms'
              }}
              focusable="false"
              aria-hidden="true"
              viewBox="0 0 24 24"
              data-testid="NavigateNextIcon"
            >
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
