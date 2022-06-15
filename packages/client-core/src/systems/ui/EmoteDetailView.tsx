import { createState } from '@speigg/hookstate'
import React, { useEffect, useState } from 'react'

import { changeAvatarAnimationState } from '@xrengine/engine/src/avatar/animation/AvatarAnimationGraph'
import { AvatarStates } from '@xrengine/engine/src/avatar/animation/Util'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'

import Button from '@mui/material/Button'

const styles = {
  actionImg: { opacity: '0.8', display: 'block', width: '100%' },
  container: {
    width: '500px',
    height: '500px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed'
  },
  itemContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    border: 'solid 100px rgba(51, 51, 110, 0.5)',
    borderBottomColor: 'transparent',
    opacity: '0.9',
    position: 'relative',
    width: '361.4px',
    height: '361.4px',
    borderWidth: '70px'
  },
  itemContainerPrev: {
    width: '40px',
    height: '70px',
    position: 'absolute',
    left: '2px',
    top: '191px',
    backgroundColor: 'rgb(51, 51, 110, 0.5)',
    transform: 'rotate(-45deg)',
    borderTopRightRadius: '50px',
    borderBottomRightRadius: '50px',
    opacity: '1'
  },
  iconBlockPrev: {
    position: 'relative',
    border: 'none',
    padding: '0',
    backgroundColor: 'transparent',
    top: '18px',
    right: '3px',
    transform: 'rotate(50deg)'
  },
  arrowSvg: {
    position: 'relative',
    zIndex: '1',
    fontSize: '30px',
    userSelect: 'none',
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fill: 'currentColor',
    flexShrink: '0'
  },
  itemContainerNext: {
    content: '',
    width: '40px',
    height: '70px',
    position: 'absolute',
    right: '2px',
    top: '191px',
    backgroundColor: 'rgb(51 51 110 / 50%)',
    transform: 'rotate(225deg)',
    borderTopRightRadius: '50px',
    borderBottomRightRadius: '50px',
    opacity: '1'
  },
  iconBlockNext: {
    position: 'relative',
    border: 'none',
    padding: '0',
    top: '18px',
    right: '3px',
    backgroundColor: 'transparent',
    transform: 'rotate(130deg)'
  },
  menuItem: {
    borderRadius: '50%',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    margin: '0',
    padding: '0',
    minWidth: '0',
    backgroundColor: 'transparent',
    border: 'none'
  }
}

export function createEmoteDetailView() {
  return createXRUI(EmoteDetailView, createEmoteDetailState())
}

function createEmoteDetailState() {
  return createState({})
}

const EmoteDetailView = () => {
  const MAX_EMOTE_PER_PAGE = 6
  const MIN_EMOTE_PER_PAGE = 5

  const getEmotePerPage = () => (window.innerWidth > 768 ? MAX_EMOTE_PER_PAGE : MIN_EMOTE_PER_PAGE)
  const [page, setPage] = useState(0)
  const [imgPerPage, setImgPerPage] = useState(getEmotePerPage())

  let [menuRadius, setMenuRadius] = useState(182)

  let menuPadding = 25
  let menuThickness = 70
  let menuItemWidth = menuThickness - menuPadding
  let menuItemRadius = menuItemWidth / 2
  let effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2

  let [items, setItems] = useState([
    {
      body: <img src="/static/grinning.svg" style={styles.actionImg as {}} alt="Dance 4" key="Dance4" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE4)
      }
    },
    {
      body: <img src="/static/sad.svg" style={styles.actionImg as {}} alt="sad" key="sad" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.CLAP)
      }
    },
    {
      body: <img src="/static/Kiss.svg" style={styles.actionImg as {}} alt="Kiss" key="Kiss" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.KISS)
      }
    },
    {
      body: <img src="/static/Cry.svg" style={styles.actionImg as {}} alt="Cry" key="Cry" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.CRY)
      }
    },
    {
      body: <img src="/static/dance_new1.svg" style={styles.actionImg as {}} alt="Dance 1" key="Dance1" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE1)
      }
    },
    {
      body: <img src="/static/clap1.svg" style={styles.actionImg as {}} alt="Dance 2" key="Dance2" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE2)
      }
    },
    {
      body: <img src="/static/victory.svg" style={styles.actionImg as {}} alt="Dance 3" key="Dance3" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DANCE3)
      }
    },
    {
      body: <img src="/static/Laugh.svg" style={styles.actionImg as {}} alt="Laugh" key="Laugh" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LAUGH)
      }
    },
    {
      body: <img src="/static/Defeat.svg" style={styles.actionImg as {}} alt="Defeat" key="Defeat" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.DEFEAT)
      }
    },
    {
      body: <img src="/static/Wave.svg" style={styles.actionImg as {}} alt="Wave" key="Wave" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.WAVE)
      }
    },
    {
      body: <img src="/static/restart.svg" style={styles.actionImg as {}} key="restart" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOCOMOTION)
      }
    }
  ])

  const calculateMenuRadius = () => {
    setImgPerPage(getEmotePerPage())
    setMenuRadius(182)
    calculateOtherValues()
  }

  useEffect(() => {
    window.addEventListener('resize', calculateMenuRadius)
    calculateOtherValues()
  }, [])

  const calculateOtherValues = (): void => {
    menuThickness = 70
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
            {...emoticon.containerProps}
            style={
              {
                width: menuItemWidth,
                height: menuItemWidth,
                transform: `translate(${x}px , ${y}px)`,
                ...styles.menuItem
              } as {}
            }
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
    <section style={styles.container as {}} xr-layer="true">
      <div style={styles.itemContainer as {}}>
        <div style={styles.itemContainerPrev as {}}>
          <button
            type="button"
            style={
              {
                ...styles.iconBlockPrev,
                ...(page === 0 ? { color: '#c3c3c3', cursor: 'initial' } : { color: '#ffffff' })
              } as {}
            }
            onClick={loadPreviousEmotes}
          >
            <svg
              style={styles.arrowSvg as {}}
              focusable="false"
              aria-hidden="true"
              viewBox="0 0 24 24"
              data-testid="NavigateBeforeIcon"
            >
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
          </button>
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
        <div style={styles.itemContainerNext as {}}>
          <button
            type="button"
            style={
              {
                ...styles.iconBlockNext,
                ...((page + 1) * imgPerPage >= items.length
                  ? { color: '#c3c3c3', cursor: 'initial' }
                  : { color: '#ffffff' })
              } as {}
            }
            onClick={loadNextEmotes}
          >
            <svg style={styles.arrowSvg as {}} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
