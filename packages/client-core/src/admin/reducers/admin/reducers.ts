import Immutable from 'immutable'
import { VideoCreatedAction } from './actions'
import { VIDEO_CREATED } from '../actions'

export const ADMIN_PAGE_LIMIT = 100

export const initialAdminState = {
  data: []
}

const immutableState = Immutable.fromJS(initialAdminState) as any

const adminReducer = (state = immutableState, action: any): any => {
  switch (action.type) {
    case VIDEO_CREATED:
      return state.set('data', (action as VideoCreatedAction).data)
  }

  return state
}

export default adminReducer
