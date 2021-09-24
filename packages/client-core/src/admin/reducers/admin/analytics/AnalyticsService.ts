import { client } from '../../../../feathers'
import { Dispatch } from 'redux'
import { AnalyticsAction } from './AnalyticsActions'

export const AnalyticsService = {
  fetchActiveParties: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const activeParties = await client.service('analytics').find({
        query: {
          type: 'activeParties',
          $limit: 30,
          $sort: {
            createdAt: -1
          }
        }
      })
      dispatch(AnalyticsAction.activePartiesFetched(activeParties))
    }
  },
  fetchActiveInstances: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const activeInstances = await client.service('analytics').find({
        query: {
          type: 'activeInstances',
          $limit: 30,
          $sort: {
            createdAt: -1
          }
        }
      })
      dispatch(AnalyticsAction.activeInstancesFetched(activeInstances))
    }
  },
  fetchActiveLocations: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const activeLocations = await client.service('analytics').find({
        query: {
          type: 'activeLocations',
          $limit: 30,
          $sort: {
            createdAt: -1
          }
        }
      })
      dispatch(AnalyticsAction.activeLocationsFetched(activeLocations))
    }
  },
  fetchActiveScenes: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const activeScenes = await client.service('analytics').find({
        query: {
          type: 'activeScenes',
          $limit: 30,
          $sort: {
            createdAt: -1
          }
        }
      })
      dispatch(AnalyticsAction.activeScenesFetched(activeScenes))
    }
  },
  fetchChannelUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const channelUsers = await client.service('analytics').find({
        query: {
          type: 'channelUsers',
          $limit: 30,
          $sort: {
            createdAt: -1
          }
        }
      })
      dispatch(AnalyticsAction.channelUsersFetched(channelUsers))
    }
  },
  fetchInstanceUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const instanceUsers = await client.service('analytics').find({
        query: {
          type: 'instanceUsers',
          $limit: 30,
          $sort: {
            createdAt: -1
          }
        }
      })
      dispatch(AnalyticsAction.instanceUsersFetched(instanceUsers))
    }
  },
  fetchDailyUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const dailyUsers = await client.service('analytics').find({
        query: {
          $limit: 30,
          action: 'dailyUsers'
        }
      })
      dispatch(AnalyticsAction.dailyUsersFetched(dailyUsers))
    }
  },
  fetchDailyNewUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      const dailyNewUsers = await client.service('analytics').find({
        query: {
          $limit: 30,
          action: 'dailyNewUsers'
        }
      })
      dispatch(AnalyticsAction.dailyNewUsersFetched(dailyNewUsers))
    }
  }
}
