import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import React from 'react'

// todo move this to core engine
const ClickawayListener = (props: { children: JSX.Element }) => {
  const childOver = useHookstate(false)
  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50"
      onClick={() => {
        if (childOver.value) return
        getMutableState(PopoverState).element.set(null)
      }}
    >
      <div
        className="z-1 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        onMouseEnter={() => childOver.set(true)}
        onMouseLeave={() => childOver.set(false)}
      >
        {props.children}
      </div>
    </div>
  )
}

ClickawayListener.displayName = 'ClickawayListener'

ClickawayListener.defaultProps = {
  children: null
}

export default ClickawayListener
