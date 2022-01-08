import { useHookstate } from '@hookstate/core'
import React, { ReactNode, useCallback, useRef } from 'react'

import Overlay from './Overlay'
import Portal from './Portal'
import Positioner from './Positioner'

interface PopoverProp {
  children?: ReactNode
  padding?: any
  position?: any
  renderContent?: any
  disabled?: boolean
}

/**
 *
 * @author Robert Long
 * @param {any} children
 * @param {any} padding
 * @param {any} position
 * @param {any} renderContent
 * @param {any} disabled
 * @param {any} rest
 * @returns
 */
export function Popover({ children, padding, position, renderContent, disabled, ...rest }: PopoverProp) {
  const popoverTriggerRef = useRef()
  const state = useHookstate({
    isOpen: false
  })

  /**
   *
   * @author Robert Long
   */
  const onOpen = useCallback(() => {
    if (!disabled) {
      state.isOpen.set(true)
    }
  }, [state.isOpen.value, disabled])

  /**
   *
   * @author Robert Long
   */
  const onClose = useCallback(
    (e) => {
      state.isOpen.set(false)
      e.stopPropagation()
    },
    [state.isOpen.value]
  )

  /**
   *
   * @author Robert Long
   */
  const onPreventClose = useCallback((e) => {
    e.stopPropagation()
  }, [])

  /**
   *
   * @author Robert Long
   */
  const getTargetRef = useCallback(() => {
    return popoverTriggerRef
  }, [popoverTriggerRef])

  return (
    <div ref={popoverTriggerRef} onClick={onOpen} {...rest}>
      {children}
      {state.isOpen.value && (
        <Portal>
          <Overlay onClick={onClose} />
          <Positioner onClick={onPreventClose} getTargetRef={getTargetRef} padding={padding} position={position}>
            {renderContent({ onClose })}
          </Positioner>
        </Portal>
      )}
    </div>
  )
}

export default Popover
