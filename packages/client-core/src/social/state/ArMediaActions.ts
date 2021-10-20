import { ArMediaResult } from '@xrengine/common/src/interfaces/ArMediaResult'
import { ArMedia } from '@xrengine/common/src/interfaces/ArMedia'

/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

export const ArMediaAction = {
  setAdminArMedia: (list: ArMediaResult[]) => {
    return {
      type: 'ARMEDIA_ADMIN_RETRIEVED' as const,
      list
    }
  },
  setArMedia: (list: ArMedia[]) => {
    return {
      type: 'ARMEDIA_RETRIEVED' as const,
      list
    }
  },
  fetchingArMedia: () => {
    return {
      type: 'ARMEDIA_FETCHING' as const
    }
  },
  addAdminArMedia: (item: ArMedia) => {
    return {
      type: 'ADD_ARMEDIA' as const,
      item
    }
  },
  removeArMediaItem: (id: string) => {
    return {
      type: 'REMOVE_ARMEDIA' as const,
      id
    }
  },
  fetchingArMediaItem: (id: string) => {
    return {
      type: 'ARMEDIA_FETCHING_ITEM' as const,
      id
    }
  },
  retrievedArMediaItem: (item: ArMedia) => {
    return {
      type: 'ARMEDIA_RETRIEVED_ITEM' as const,
      item
    }
  },
  updateAdminArMedia: (result: ArMedia) => {
    return {
      type: 'UPDATE_AR_MEDIA' as const,
      item: result
    }
  }
}

export type ArMediaActionType = ReturnType<typeof ArMediaAction[keyof typeof ArMediaAction]>
