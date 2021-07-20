import Immutable from 'immutable'
import { ADMIN_FETCH_AR_MEDIA } from '../../actions'
import { ArmediaRetrievedActions } from './actions'

export const PAGE_LIMIT = 100
const initialAdminState = {
  armedia: {
    armedia: [],
    skip: 0,
    limit: PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
}

const immutableState = Immutable.fromJS(initialAdminState)

const armediaReducer = (state = immutableState, action: any) => {
  let result: any, updateMap: any
  switch (action.type) {
    case ADMIN_FETCH_AR_MEDIA:
      result = (action as ArmediaRetrievedActions).data
      updateMap = new Map(state.get('armedia'))
      updateMap.set('armedia', result.data)
      updateMap.set('skip', (result as any).skip)
      updateMap.set('limit', (result as any).limit)
      updateMap.set('total', (result as any).total)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('armedia', updateMap)
  }
  return state
}

export default armediaReducer
