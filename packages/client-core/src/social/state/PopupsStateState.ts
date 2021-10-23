/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */

import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { store } from '../../store'
import { PopupsStateActionType } from './PopupsStateActions'

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
