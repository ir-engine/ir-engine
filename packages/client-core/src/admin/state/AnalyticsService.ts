import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { AnalyticsAction } from './AnalyticsActions'

export const AnalyticsService = {
  fetchActiveParties: async () => {
    const dispatch = useDispatch()
    {
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
  fetchActiveInstances: async () => {
    const dispatch = useDispatch()
    {
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
  fetchActiveLocations: async () => {
    const dispatch = useDispatch()
    {
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
  fetchActiveScenes: async () => {
    const dispatch = useDispatch()
    {
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
  fetchChannelUsers: async () => {
    const dispatch = useDispatch()
    {
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
  fetchInstanceUsers: async () => {
    const dispatch = useDispatch()
    {
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
  fetchDailyUsers: async () => {
    const dispatch = useDispatch()
    {
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
  fetchDailyNewUsers: async () => {
    const dispatch = useDispatch()
    {
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
