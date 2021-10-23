/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// const thefeeds = '';
// conts TheFeeds = '';
// const THEFEEDS = '';

import { TheFeedsShort, TheFeeds } from '@xrengine/common/src/interfaces/Feeds'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { TheFeedsActionType } from './TheFeedsActions'
import { store } from '../../store'

const state = createState({
  thefeeds: [] as Array<TheFeeds>,
  fetching: false
})

store.receptors.push((action: TheFeedsActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'THEFEEDS_FETCH':
        return s.fetching.set(true)
      case 'THEFEEDS_RETRIEVED':
        return s.merge({ thefeeds: action.thefeeds, fetching: false })
      case 'ADD_THEFEEDS':
        return s.thefeeds.set([...s.thefeeds.value, action.thefeeds])
      case 'UPDATE_THEFEEDS':
        return s.thefeeds.set(
          s.thefeeds.value.map((thefeeds) => {
            if (thefeeds.id === action.thefeeds.id) {
              return { ...thefeeds, ...action.thefeeds }
            }
            return { ...thefeeds }
          })
        )
      case 'REMOVE_THEFEEDS':
        return s.thefeeds.set([...s.thefeeds.value.filter((thefeeds) => thefeeds.id !== action.thefeeds)])
    }
  }, action.type)
})

export const accessTheFeedsState = () => state
export const useTheFeedsState = () => useState(state)
