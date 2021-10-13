/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

export const ArMediaAction = {
  setAdminArMedia: (list: any[]) => {
    return {
      type: 'ARMEDIA_ADMIN_RETRIEVED' as const,
      list
    }
  },
  setArMedia: (list: any[]) => {
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
  addAdminArMedia: (item) => {
    return {
      type: 'ADD_ARMEDIA' as const,
      item
    }
  },
  removeArMediaItem: (id) => {
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
  retrievedArMediaItem: (item) => {
    return {
      type: 'ARMEDIA_RETRIEVED_ITEM' as const,
      item
    }
  },
  updateAdminArMedia: (result) => {
    return {
      type: 'UPDATE_AR_MEDIA' as const,
      item: result
    }
  }
}

export type ArMediaActionType = ReturnType<typeof ArMediaAction[keyof typeof ArMediaAction]>
