/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { createState } from '@hookstate/core'
import React, { useEffect, useState } from 'react'

import { changeAvatarAnimationState } from '@etherealengine/engine/src/avatar/animation/AvatarAnimationGraph'
import { AvatarStates } from '@etherealengine/engine/src/avatar/animation/Util'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import XRIconButton from '../../components/XRIconButton'
import styleString from './index.scss?inline'

/** @deprecated */
export function createEmoteDetailView() {
  return createXRUI(EmoteDetailView, createEmoteDetailState())
}

function createEmoteDetailState() {
  return createState({})
}
/** @deprecated */
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
    const entity = Engine.instance.localClientEntity
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
              content={<Icon type="ArrowBackIos" />}
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
              content={<Icon type="ArrowForwardIos" />}
            />
          </div>
        </div>
      </section>
    </>
  )
}
