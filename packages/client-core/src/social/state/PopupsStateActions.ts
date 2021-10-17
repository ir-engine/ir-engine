/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

export const PopupsStateAction = {
  changeCreatorPage: (state: boolean, id?: string) => {
    return {
      type: 'CHANGE_CREATOR_PAGE_STATE' as const,
      state,
      id
    }
  },
  changeCreatorForm: (state: boolean) => {
    return {
      type: 'CHANGE_CREATOR_FORM_STATE' as const,
      state
    }
  },
  changeFeedPage: (state: boolean, id?: string) => {
    return {
      type: 'CHANGE_FEED_PAGE_STATE' as const,
      state,
      id
    }
  },
  changeArMedia: (state: boolean) => {
    return {
      type: 'CHANGE_ARMEDIA_CHOOSE_STATE' as const,
      state
    }
  },
  changeNewFeedPage: (state: boolean, id?: string, fPath?: string, nameId?: string) => {
    return {
      type: 'CHANGE_NEW_FEED_PAGE_STATE' as const,
      state,
      id,
      fPath,
      nameId
    }
  },
  changeShareForm: (state: boolean, id?: string, imgSrc?: string) => {
    return {
      type: 'CHANGE_SHARE_FORM_STATE' as const,
      state,
      id,
      imgSrc
    }
  },
  changeWebXR: (state?: boolean, itemId?: number) => {
    return {
      type: 'CHANGE_WEB_XR_STATE' as const,
      state,
      itemId
    }
  }
}

export type PopupsStateActionType = ReturnType<typeof PopupsStateAction[keyof typeof PopupsStateAction]>
