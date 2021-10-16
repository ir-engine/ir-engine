import { ContentPackActionType } from './ContentPackActions'
import _ from 'lodash'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

const state = createState({
  contentPacks: [],
  updateNeeded: true
})

export const receptor = (action: ContentPackActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOADED_CONTENT_PACKS':
        return s.merge({ updateNeeded: false, contentPacks: action.contentPacks })
      case 'CONTENT_PACK_CREATED':
        return s.merge({ updateNeeded: true })
      case 'CONTENT_PACK_PATCHED':
        return s.merge({ updateNeeded: true })
    }
  }, action.type)
}

export const accessContentPackState = () => state

export const useContentPackState = () => useState(state) as any as typeof state
