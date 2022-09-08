import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

export const DebugState = defineState({
  name: 'DebugState',
  initial: () => ({
    show: false,
    lastClick: [0, 0]
  })
})

export function DebugActionReceptor(action) {
  const s = getState(DebugState)
  matches(action).when(DebugAction.setLastClick.matches, (action) => {
    return s.merge({ lastClick: action.lastClick, show: true })
  })
}

export class DebugAction {
  static setLastClick = defineAction({
    type: 'DEBUG_SET_LAST_CLICK' as const,
    lastClick: matches.arrayOf(matches.number) as Validator<unknown, [number, number]>
  })
}

export function setLastClick(coords: [number, number]) {
  dispatchAction(
    DebugAction.setLastClick({
      lastClick: coords
    })
  )
}

export const useDebugState = () => useState(getState(DebugState))
