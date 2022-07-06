import classNames from 'classnames'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef, useState } from 'react'

import styles from './index.module.scss'

type PropsType = {
  isPiP: boolean
  isScreenMe: boolean
  children: any
}
export const Resizeable = ({ isPiP, isScreenMe, children }: PropsType): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [isFixedWidth, setIsFixedWidth] = useState(false)
  let resizableComponent

  useEffect(() => {
    console.error(isOpen, isPiP)
    if (isOpen != isPiP && resizableComponent) {
      resizableComponent.updateSize({ width: 'auto', height: 'auto' })
      setIsFixedWidth(isPiP)
    }
    setIsOpen(isPiP)
  })
  return (
    <div
      className={classNames({
        [styles['resizeable-screen']]: isPiP && isScreenMe,
        [styles['resizeable-screen-fixed']]: isFixedWidth
      })}
    >
      <Resizable
        ref={(c) => {
          resizableComponent = c
        }}
        lockAspectRatio={isOpen}
        minWidth={isOpen ? 250 : 'auto'}
        enable={{
          top: isPiP,
          right: isPiP,
          bottom: isPiP,
          left: isPiP,
          topRight: isPiP,
          bottomRight: isPiP,
          bottomLeft: isPiP,
          topLeft: isPiP
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
          }
          setIsFixedWidth(false)
        }}
      >
        {children}
      </Resizable>
    </div>
  )
}

export default Resizeable
