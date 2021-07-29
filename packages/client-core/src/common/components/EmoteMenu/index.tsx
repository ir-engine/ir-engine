import React, { MouseEventHandler } from 'react'
import Button from '@material-ui/core/Button'
import ScrollableElement from '../ScrollableElement'
// @ts-ignore
import styles from './EmoteMenu.module.scss'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '@xrengine/engine/src/input/components/LocalInputReceiver'
import {
  WeightsParameterType,
  CharacterAnimations,
  CharacterStates
} from '@xrengine/engine/src/character/animations/Util'
import { AnimationGraph } from '@xrengine/engine/src/character/animations/AnimationGraph'

type MenuItemType = {
  body: any
  containerProps: {
    onClick: MouseEventHandler<HTMLButtonElement>
  }
}

type EmoteMenuPropsType = {
  // items: MenuItemType[];
}

const EmoteMenuCore = (props: EmoteMenuPropsType) => {
  const items: MenuItemType[] = [
    {
      body: <img src="/static/Dance1.svg" alt="Dance 1" />,
      containerProps: {
        onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.DANCING_1 })
      }
    },
    {
      body: <img src="/static/Dance2.svg" alt="Dance 2" />,
      containerProps: {
        onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.DANCING_2 })
      }
    },
    {
      body: <img src="/static/Dance3.svg" alt="Dance 3" />,
      containerProps: {
        onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.DANCING_3 })
      }
    },
    {
      body: <img src="/static/Dance4.svg" alt="Dance 4" />,
      containerProps: {
        onClick: () => runAnimation(CharacterStates.LOOPABLE_EMOTE, { animationName: CharacterAnimations.DANCING_4 })
      }
    }
  ]

  const runAnimation = (animationName: string, params: WeightsParameterType) => {
    const entity = Engine.entities.find((e) => e.name === 'Player' && hasComponent(e, LocalInputReceiver))

    AnimationGraph.forceUpdateAnimationState(entity, animationName, params)
  }

  return (
    <section className={styles.emoteMenu}>
      <ScrollableElement height={400}>
        {items.map((item, index) => {
          return (
            <Button className={styles.menuItem} key={index} {...item.containerProps}>
              {item.body}
            </Button>
          )
        })}
      </ScrollableElement>
      {/* <div className={styles.jumpContainer}>
                <Button
                    className={styles.menuItem}
                    onMouseDown={jumpStart}
                    onMouseUp={jumpStop}
                >
                    <img src="/static/Jump.svg" alt="Jump" />
                </Button>
            </div> */}
    </section>
  )
}

export default EmoteMenuCore
