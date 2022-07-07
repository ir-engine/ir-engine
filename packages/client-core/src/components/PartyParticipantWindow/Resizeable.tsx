import classNames from 'classnames'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef, useState } from 'react'

import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'

import styles from './index.module.scss'

type PropsType = {
  isPiP: boolean
  isScreenMe: boolean
  children: any
}
export const Resizeable = ({ isPiP, isScreenMe, children }: PropsType): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFixedWidth, setIsFixedWidth] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const clientHeight = EngineRenderer.instance.renderer.domElement.clientHeight - 120
  let resizableComponent

  useEffect(() => {
    if (isOpen != isPiP && resizableComponent) {
      resizableComponent.updateSize({ width: 'auto', height: 'auto' })
      setIsFixedWidth(isPiP)
    }
    setIsOpen(isPiP)
  }, [isPiP, isScreenMe])
  return (
    <div
      className={classNames({
        [styles['resizeable-screen']]: isPiP && isScreenMe,
        [styles['resizeable-screen-mini']]: !isPiP && isScreenMe,
        [styles['resizeable-screen-fixed']]: isFixedWidth && isScreenMe,
        [styles['resizeable-screen-fullscreen']]: isFullScreen
      })}
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
            resizableComponent.updateSize({ width: 500, height: 'auto' })
            setIsFixedWidth(false)
          }
          if (isFullScreen) {
            resizableComponent.updateSize({ width: 'auto', height: clientHeight - 10 })
            setIsFullScreen(false)
          }
        }}
        onResize={() => {
          if (resizableComponent) {
            if (clientHeight < resizableComponent.state.height) {
              resizableComponent.updateSize({ width: '100%', height: '100%' })
              setIsFullScreen(true)
            }
          }
        }}
      >
        {children}
      </Resizable>
    </div>
  )
}

export default Resizeable
