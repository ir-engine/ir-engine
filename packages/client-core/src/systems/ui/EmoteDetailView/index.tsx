import { createState } from '@hookstate/core'
import React, { useEffect, useState } from 'react'

import { changeAvatarAnimationState } from '@xrengine/engine/src/avatar/animation/AvatarAnimationGraph'
import { AvatarStates } from '@xrengine/engine/src/avatar/animation/Util'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material'
import { Button } from '@mui/material'

import XRIconButton from '../../components/XRIconButton'
import styleString from './index.scss'

export function createEmoteDetailView() {
  return createXRUI(EmoteDetailView, createEmoteDetailState())
}

function createEmoteDetailState() {
  return createState({})
}

const EmoteDetailView = () => {
  const [page, setPage] = useState(0)

  const imgPerPage = 7
  let menuRadius = 250
  let menuPadding = 25
  let menuThickness = menuRadius > 170 ? 70 : 60
  let menuItemWidth = menuThickness - menuPadding
  let menuItemRadius = menuItemWidth / 2
  let effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2

  let [items, setItems] = useState([
    {
      body: <img src="/static/grinning.svg" alt="Dance 4" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE4)
      }
    },
    {
      body: <img src="/static/sad.svg" alt="sad" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.CLAP)
      }
    },
    {
      body: <img src="/static/Kiss.svg" alt="Kiss" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.KISS)
      }
    },
    {
      body: <img src="/static/Cry.svg" alt="Cry" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.CRY)
      }
    },
    {
      body: <img src="/static/dance_new1.svg" alt="Dance 1" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE1)
      }
    },
    {
      body: <img src="/static/clap1.svg" alt="Dance 2" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE2)
      }
    },
    {
      body: <img src="/static/victory.svg" alt="Dance 3" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE3)
      }
    },
    {
      body: <img src="/static/Laugh.svg" alt="Laugh" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LAUGH)
      }
    },
    {
      body: <img src="/static/Defeat.svg" alt="Defeat" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DEFEAT)
      }
    },
    {
      body: <img src="/static/Wave.svg" alt="Wave" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.WAVE)
      }
    },
    {
      body: <img src="/static/restart.svg" />,
      containerProps: {
        //onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.IDLE })
      }
    }
  ])

  const calculateMenuRadius = () => {
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
    const entity = Engine.instance.currentWorld.localClientEntity
    changeAvatarAnimationState(entity, stateName)
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
            className="menuItem"
            {...emoticon.containerProps}
            style={{
              width: menuItemWidth,
              height: menuItemWidth,
              transform: `translate(${x}px , ${y}px)`
            }}
          >
            {emoticon.body}
          </Button>
        </div>
      )
    }

    return itemList
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
    <>
      <style>{styleString}</style>
      <section className="container" xr-layer="true">
        <div className="itemContainer">
          <div className="itemContainerPrev">
            <XRIconButton
              xr-layer="true"
              onClick={loadPreviousEmotes}
              disabled={page === 0}
              size="medium"
              variant="iconOnly"
              content={<ArrowBackIos />}
            />
          </div>
          <div
            style={{
              width: menuItemRadius,
              height: menuItemRadius,
              position: 'relative'
            }}
          >
            {renderEmoteList()}
          </div>
          <div className="itemContainerNext">
            <XRIconButton
              xr-layer="true"
              onClick={loadNextEmotes}
              disabled={(page + 1) * imgPerPage >= items.length}
              size="medium"
              variant="iconOnly"
              content={<ArrowForwardIos />}
            />
          </div>
        </div>
      </section>
    </>
  )
}
