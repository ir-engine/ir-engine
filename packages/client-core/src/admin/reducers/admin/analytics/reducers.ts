import Immutable from 'immutable'
import {
  ACTIVE_INSTANCES_FETCHED,
  ACTIVE_PARTIES_FETCHED,
  ACTIVE_LOCATIONS_FETCHED,
  ACTIVE_SCENES_FETCHED,
  CHANNEL_USERS_FETCHED,
  INSTANCE_USERS_FETCHED,
  DAILY_NEW_USERS_FETCHED,
  DAILY_USERS_FETCHED,
  AnalyticsFetchedAction
} from './actions'

export const ANALYTICS_PAGE_LIMIT = 100

export const initialAnalyticAdminState = {
  activeInstances: [],
  activeParties: [],
  instanceUsers: [],
  channelUsers: [],
  activeLocations: [],
  activeScenes: [],
  dailyUsers: [],
  dailyNewUsers: []
}

const immutableState = Immutable.fromJS(initialAnalyticAdminState) as any

const analyticsReducer = (state = immutableState, action: any): any => {
  let result: any, updateMap: any, date: Date
  switch (action.type) {
    case ACTIVE_INSTANCES_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'activeInstances',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
    case ACTIVE_PARTIES_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'activeParties',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
    case ACTIVE_LOCATIONS_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'activeLocations',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
    case ACTIVE_SCENES_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'activeScenes',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
    case CHANNEL_USERS_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'channelUsers',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
    case INSTANCE_USERS_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'instanceUsers',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
    case DAILY_NEW_USERS_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'dailyNewUsers',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
    case DAILY_USERS_FETCHED:
      result = (action as AnalyticsFetchedAction).analytics
      return state.set(
        'dailyUsers',
        result.data
          .map((item) => {
            return { x: new Date(item.createdAt), y: item.count }
          })
          .reverse()
      )
  }

  return state
}

export default analyticsReducer
