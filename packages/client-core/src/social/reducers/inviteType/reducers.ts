import Immutable from 'immutable'
import { LOAD_INVITE_TYPE } from '../actions'
import { InvitesTypesRetrievedAction, InviteTypeAction } from './actions'

export const initialInviteTypeState = {
  inviteTypeData: {
    invitesType: [],
    skip: 0,
    limit: 5,
    total: 0
  }
}

const immutableState = Immutable.fromJS(initialInviteTypeState)

const inviteTypeReducer = (state = immutableState, action: InviteTypeAction): any => {
  let newValues, updateMap
  switch (action.type) {
    case LOAD_INVITE_TYPE:
      newValues = action as InvitesTypesRetrievedAction
      const inviteType = state.get('inviteTypeData').get('invitesType')
      updateMap = new Map()
      updateMap.set(
        'inviteType',
        inviteType.size != null ? newValues.invitesType : inviteType.concat(newValues.invitesType)
      )
      updateMap.set('skip', newValues.skip)
      updateMap.set('limit', newValues.limit)
      updateMap.set('total', newValues.total)
      return state.set('inviteTypeData', updateMap)
  }
  return state
}

export default inviteTypeReducer
