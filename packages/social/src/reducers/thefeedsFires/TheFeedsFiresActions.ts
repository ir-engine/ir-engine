/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */

import { CreatorShort } from '@xrengine/common/src/interfaces/Creator'

// thefeeds
// TheFeeds
// THEFEEDS

export const TheFeedsFiresAction = {
  addThefeedsFires: (thefeedsFire: CreatorShort) => {
    return {
      type: 'ADD_THEFEEDS_FIRES' as const,
      thefeedsFire
    }
  },
  removeThefeedsFires: (thefeedsFireId: String) => {
    return {
      type: 'REMOVE_THEFEEDS_FIRES' as const,
      thefeedsFireId
    }
  },
  thefeedsFiresRetrieved: (thefeedsFires: CreatorShort[]) => {
    return {
      type: 'THEFEEDS_FIRES_RETRIEVED' as const,
      thefeedsFires: thefeedsFires
    }
  },
  fetchingTheFeedsFires: () => {
    return {
      type: 'THEFEEDS_FIRES_FETCH' as const
    }
  }
}

export type TheFeedsFiresActionType = ReturnType<typeof TheFeedsFiresAction[keyof typeof TheFeedsFiresAction]>
