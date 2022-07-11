import classNames from 'classnames'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef, useState } from 'react'

import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'

import styles from './index.module.scss'

type PropsType = {
  isPiP: boolean
  isScreenMe: boolean
  setIsControlVisible: any
  children: any
}
export const Resizeable = ({ isPiP, isScreenMe, setIsControlVisible, children }: PropsType): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFixedWidth, setIsFixedWidth] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(0)
  const clientHeight = EngineRenderer.instance.renderer.domElement.clientHeight - 150
  let resizableComponent
  let timeout

  useEffect(() => {
    if (isOpen != isPiP && resizableComponent) {
      setIsFixedWidth(isPiP)
      if (!isOpen && isPiP && isScreenMe) {
        resizableComponent.updateSize({ width: 250, height: 'auto' })
      } else {
        resizableComponent.updateSize({ width: 'auto', height: 'auto' })
      }
    }
    setIsOpen(isPiP)
    if (!isPiP) setIsFullScreen(0)
  }, [isPiP, isScreenMe])
  const mouseEnter = () => {}
  const mouseLeave = () => {}
  const mouseMove = () => {
    // if (isFullScreen > 0)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      console.error('disable control visible')
      setIsControlVisible(false)
    }, 3000)
    setIsControlVisible(true)
  }
  return (
    <div
      className={classNames({
        [styles['resizeable-screen']]: isPiP && isScreenMe,
        [styles['resizeable-screen-mini']]: !isPiP && isScreenMe,
        [styles['resizeable-screen-fullscreen']]: isFullScreen > 0
      })}
      onMouseEnter={() => mouseEnter()}
      onMouseLeave={() => mouseLeave()}
      onMouseMove={() => mouseMove()}
    >
      <Resizable
        ref={(c) => {
          resizableComponent = c
        }}
        lockAspectRatio={isOpen}
        minWidth={isOpen ? 250 : 'auto'}
        enable={{
          top: isPiP && isScreenMe,
          right: isPiP && isScreenMe,
          bottom: isPiP && isScreenMe,
          left: isPiP && isScreenMe,
          topRight: isPiP && isScreenMe,
          bottomRight: isPiP && isScreenMe,
          bottomLeft: isPiP && isScreenMe,
          topLeft: isPiP && isScreenMe
        }}
        handleStyles={{
          bottom: {
            width: 'auto',
            height: 60,
            zIndex: 9999,
            cursor: 'n-resize',
            left: 35,
            right: 35
          }
        }}
        onResizeStart={() => {
          if (isFixedWidth) {
            resizableComponent.updateSize({ width: 250, height: 'auto' })
            setIsFixedWidth(false)
          }
        }}
        onResize={() => {
          if (resizableComponent && !isFullScreen) {
            if (clientHeight < resizableComponent.state.height) {
              resizableComponent.updateSize({ width: '100%', height: '100%' })
              setIsFullScreen(1)
            }
          }
        }}
        onResizeStop={() => {
          if (isFullScreen == 1) {
            setIsFullScreen(2)
          } else if (isFullScreen == 2) {
            resizableComponent.updateSize({ width: 250, height: 'auto' })
            setIsFullScreen(0)
          }
        }}
      >
        {children}
      </Resizable>
    </div>
  )
}

export default Resizeable
