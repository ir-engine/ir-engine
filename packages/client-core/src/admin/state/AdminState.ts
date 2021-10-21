import { AdminActionType } from './AdminActions'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

export const ADMIN_PAGE_LIMIT = 100

const state = createState({
  data: {}
})

export const receptor = (action: AdminActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'VIDEO_CREATED':
        return s.merge({ data: action.data })
    }
  }, action.type)
}

export const accessAdminState = () => state
export const useAdminState = () => useState(state) as any as typeof state
