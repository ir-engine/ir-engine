0
/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { TheFeedsShort, TheFeeds } from '@standardcreative/common/src/interfaces/Feeds'

export const TheFeedsAction = {
  thefeedsRetrieved: (thefeeds: TheFeeds[]) => {
    // console.log('actions',thefeeds)
    return {
      type: 'THEFEEDS_RETRIEVED' as const,
      thefeeds: thefeeds
    }
  },
  fetchingTheFeeds: () => {
    return {
      type: 'THEFEEDS_FETCH' as const
    }
  },
  deleteTheFeeds: (thefeedsId: string) => {
    return {
      type: 'REMOVE_THEFEEDS' as const,
      thefeeds: thefeedsId
    }
  },
  addTheFeeds: (thefeeds: TheFeeds) => {
    return {
      type: 'ADD_THEFEEDS' as const,
      thefeeds: thefeeds
    }
  },
  updateTheFeedsInList: (thefeeds: TheFeeds) => {
    return {
      type: 'UPDATE_THEFEEDS' as const,
      thefeeds: thefeeds
    }
  },
  addTheFeedsFire: (thefeeds: string) => {
    return {
      type: 'ADD_THEFEEDS_FIRES' as const,
      thefeeds: thefeeds
    }
  },
  removeTheFeedsFire: (thefeeds: string) => {
    return {
      type: 'REMOVE_THEFEEDS_FIRES' as const,
      thefeeds: thefeeds
    }
  }
}
//The code below is not in use END

export type TheFeedsActionType = ReturnType<typeof TheFeedsAction[keyof typeof TheFeedsAction]>
