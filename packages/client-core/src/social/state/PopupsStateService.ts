/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { store, useDispatch } from '../../store'
import { AlertService } from '../../common/state/AlertService'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
const state = createState({
  popups: {
    creatorPage: false,
    creatorForm: false,
    creatorId: null,
    feedPage: false,
    feedId: null,
    shareFeedPage: false,
    arMedia: false,
    shareForm: false,
    videoUrl: null,
    webxr: false,
    videoPath: null,
    imgSrc: null,
    fPath: null,
    nameId: null,
    itemId: null
  }
})

store.receptors.push((action: PopupsStateActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CHANGE_CREATOR_PAGE_STATE':
        return s.popups.merge({ creatorPage: action.state, creatorId: action.id })
      case 'CHANGE_CREATOR_FORM_STATE':
        return s.popups.creatorForm.set(action.state)
      case 'CHANGE_FEED_PAGE_STATE':
        return s.popups.merge({ feedPage: action.state, feedId: action.id })
      case 'CHANGE_ARMEDIA_CHOOSE_STATE':
        return s.popups.arMedia.set(action.state)
      case 'CHANGE_NEW_FEED_PAGE_STATE':
        return s.popups.merge({
          shareFeedPage: action.state,
          videoPath: action.id,
          fPath: action.fPath,
          nameId: action.nameId
        })
      case 'CHANGE_SHARE_FORM_STATE':
        return s.popups.merge({ shareForm: action.state, videoUrl: action.id, imgSrc: action.imgSrc })
      case 'CHANGE_WEB_XR_STATE':
        return s.popups.merge({ webxr: action.state, itemId: action.itemId })
    }
  }, action.type)
})

export const accessPopupsStateState = () => state
export const usePopupsStateState = () => useState(state)

//Service
export const PopupsStateService = {
  updateCreatorPageState: async (state: boolean, id?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeCreatorPage(state, id))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateCreatorFormState: async (state: boolean) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeCreatorForm(state))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateFeedPageState: async (state: boolean, id?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeFeedPage(state, id))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateNewFeedPageState: async (state: boolean, id?: string, fPath?: string, nameId?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeNewFeedPage(state, id, fPath, nameId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateShareFormState: async (state: boolean, id?: string, imgSrc?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeShareForm(state, id, imgSrc))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateArMediaState: async (state: boolean) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeArMedia(state))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  updateWebXRState: async (state: boolean, itemId: number) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(PopupsStateAction.changeWebXR(state, itemId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}

//Action
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
