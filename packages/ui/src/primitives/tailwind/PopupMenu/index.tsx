import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import React from 'react'
import ClickawayListener from '../ClickawayListener'

const PopupMenu = () => {
  const popoverElement = useHookstate(getMutableState(PopoverState).element)
  const PopoverComponent = popoverElement.get(NO_PROXY) as any // types are broken for some reason...
  return <>{popoverElement.value && <ClickawayListener>{PopoverComponent}</ClickawayListener>}</>
}
PopupMenu.displayName = 'PopupMenu'

PopupMenu.defaultProps = {}

export default PopupMenu
