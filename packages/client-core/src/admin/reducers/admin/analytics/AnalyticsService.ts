import { client } from '../../../../feathers'
import { Dispatch } from 'redux'
import { AnalyticsAction } from './AnalyticsActions'

export const AnalyticsService = {
  fetchActiveParties: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
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
      } catch (err) {
        console.log(err)
      }
    }
  },
  fetchActiveInstances: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
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
      } catch (err) {
        console.log(err)
      }
    }
  },
  fetchActiveLocations: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
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
      } catch (err) {
        console.log(err)
      }
    }
  },
  fetchActiveScenes: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
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
      } catch (err) {
        console.log(err)
      }
    }
  },
  fetchChannelUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
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
      } catch (err) {
        console.log(err)
      }
    }
  },
  fetchInstanceUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
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
      } catch (err) {
        console.log(err)
      }
    }
  },
  fetchDailyUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const dailyUsers = await client.service('analytics').find({
          query: {
            $limit: 30,
            action: 'dailyUsers'
          }
        })
        dispatch(AnalyticsAction.dailyUsersFetched(dailyUsers))
      } catch (error) {
        console.log(error)
      }
    }
  },
  fetchDailyNewUsers: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const dailyNewUsers = await client.service('analytics').find({
          query: {
            $limit: 30,
            action: 'dailyNewUsers'
          }
        })
        dispatch(AnalyticsAction.dailyNewUsersFetched(dailyNewUsers))
      } catch (err) {
        console.log(err)
      }
    }
  }
}
