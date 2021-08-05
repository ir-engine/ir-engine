/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// const reports = '';
// conts Reports = '';
// const REPORTS = '';
import { ADD_REPORTS, REMOVE_REPORTS, REPORTS_FETCH, REPORTS_RETRIEVED, UPDATE_REPORTS } from './actions'
import Immutable from 'immutable'
import { ReportsRetrievedAction, ReportsAction } from './actions'

export const initialFeedsState = {
  reports: {}
}

const immutableState = Immutable.fromJS(initialFeedsState)

const reportsReducer = (state = immutableState, action: ReportsAction): any => {
  switch (action.type) {
    case REPORTS_FETCH:
      return state.set('fetching', true)
    case REPORTS_RETRIEVED:
      return state.set('reports', (action as ReportsRetrievedAction).reports).set('fetching', false)
    case ADD_REPORTS:
      return state.set('reports', [...state.get('reports'), (action as ReportsRetrievedAction).reports])
    case UPDATE_REPORTS:
      return state.set(
        'reports',
        state.get('reports').map((reports) => {
          if (reports.id === (action as ReportsRetrievedAction).reports.id) {
            return { ...reports, ...(action as ReportsRetrievedAction).reports }
          }
          return { ...reports }
        })
      )
    case REMOVE_REPORTS:
      return state.set('reports', [
        ...state.get('reports').filter((reports) => reports.id !== (action as ReportsRetrievedAction).reports)
      ])
  }

  return state
}

export default reportsReducer
