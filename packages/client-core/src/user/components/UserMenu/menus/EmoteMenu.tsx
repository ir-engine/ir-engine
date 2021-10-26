import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
// @ts-ignore
import styles from '../UserMenu.module.scss'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '@xrengine/engine/src/input/components/LocalInputTagComponent'
//import { LocalInputTagComponent } from '../../../../../engine/src/input/components/LocalInputTagComponent'
import { WeightsParameterType, AvatarAnimations, AvatarStates } from '@xrengine/engine/src/avatar/animations/Util'
import { AnimationGraph } from '@xrengine/engine/src/avatar/animations/AnimationGraph'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

const EmoteMenu = (props: any): any => {
  let [menuRadius, setMenuRadius] = useState(window.innerWidth > 360 ? 182 : 150)

  let menuPadding = window.innerWidth > 360 ? 15 : 10
  let menuThickness = menuRadius > 170 ? 70 : 60
  let menuItemWidth = menuThickness - menuPadding
  let menuItemRadius = menuItemWidth / 2
  let effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2

  let [items, setItems] = useState([
    /*{
      body: <img src="/static/Dance1.svg" alt="Dance 1" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_1 })
      }
    },
    {
      body: <img src="/static/Dance2.svg" alt="Dance 2" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_2 })
      }
    },
    {
      body: <img src="/static/Dance3.svg" alt="Dance 3" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_3 })
      }
    },
    {
      body: <img src="/static/Dance4.svg" alt="Dance 4" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_4 })
      }
    },
    {
      body: <img src="/static/Clap.svg" alt="Clap" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.CLAP })
      }
    },
    {
      body: <img src="/static/Cry.svg" alt="Cry" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.CRY })
      }
    },
    {
      body: <img src="/static/Laugh.svg" alt="Laugh" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.LAUGH })
      }
    },
    {
      body: <img src="/static/Defeat.svg" alt="Defeat" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.DEFEAT })
      }
    },
    {
      body: <img src="/static/Kiss.svg" alt="Kiss" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.KISS })
      }
    },
    {
      body: <img src="/static/Wave.svg" alt="Wave" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.WAVE })
      }
    }*/
    {
      body: <img src="/static/grinning.svg" alt="Dance 4" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_4 })
      }
    },
    {
      body: <img src="/static/sad.svg" alt="sad" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.CLAP })
      }
    },
    {
      body: <img src="/static/Kiss.svg" alt="Kiss" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.KISS })
      }
    },

    {
      body: <img src="/static/Cry.svg" alt="Cry" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.EMOTE, { animationName: AvatarAnimations.CRY })
      }
    },
    {
      body: <img src="/static/dance_new1.svg" alt="Dance 1" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_1 })
      }
    },
    {
      body: <img src="/static/clap1.svg" alt="Dance 2" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_2 })
      }
    },

    {
      body: <img src="/static/victory.svg" alt="Dance 3" />,
      containerProps: {
        onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.DANCING_3 })
      }
    }
    // {
    //   body: <img src="/static/restart.svg" />,
    //   containerProps: {
    //     onClick: () => runAnimation(AvatarStates.LOOPABLE_EMOTE, { animationName: AvatarAnimations.IDLE})
    //   }
    // }
  ])

  const calculateMenuRadius = () => {
    setMenuRadius(window.innerWidth > 360 ? 182 : 150)
    calculateOtherValues()
  }

  useEffect(() => {
    window.addEventListener('resize', calculateMenuRadius)
    calculateOtherValues()
  }, [])

  const closeMenu = (e) => {
    e.preventDefault()
    props.changeActiveMenu(null)
  }

  const calculateOtherValues = (): void => {
    menuThickness = menuRadius > 170 ? 70 : 60
    menuItemWidth = menuThickness - menuPadding
    menuItemRadius = menuItemWidth / 2
    effectiveRadius = menuRadius - menuItemRadius - menuPadding / 2
  }

  const runAnimation = (animationName: string, params: WeightsParameterType) => {
    const entity = Engine.defaultWorld.entities.find((e) => hasComponent(e, LocalInputTagComponent))

    AnimationGraph.forceUpdateAnimationState(entity, animationName, params)

    // close Menu after playing animation
    props.changeActiveMenu(null)
  }

  return (
    <section className={styles.emoteMenu}>
      <ClickAwayListener onClickAway={closeMenu} mouseEvent="onMouseDown">
        <div
          className={styles.itemContainer}
          style={{
            width: menuRadius * 2,
            height: menuRadius * 2,
            borderWidth: menuThickness
          }}
        >
          <div
            className={styles.menuItemBlock}
            style={{
              width: menuItemRadius,
              height: menuItemRadius
            }}
          >
            {items.map((item, index) => {
              const angle = 360 / items.length
              const itemAngle = angle * index + 270
              const x = effectiveRadius * Math.cos((itemAngle * Math.PI) / 280)
              const y = effectiveRadius * Math.sin((itemAngle * Math.PI) / 280)
              return (
                <Button
                  className={styles.menuItem}
                  key={index}
                  style={{
                    width: menuItemWidth,
                    height: menuItemWidth,
                    transform: `translate(${x}px , ${y}px)`
                  }}
                  {...item.containerProps}
                >
                  {item.body}
                </Button>
              )
            })}
          </div>
        </div>
      </ClickAwayListener>
    </section>
  )
}

export default EmoteMenu
