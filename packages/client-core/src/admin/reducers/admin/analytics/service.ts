import {
  activePartiesFetched,
  activeInstancesFetched,
  activeLocationsFetched,
  activeScenesFetched,
  channelUsersFetched,
  instanceUsersFetched,
  dailyNewUsersFetched,
  dailyUsersFetched
} from './actions'
import { client } from '../../../../feathers'
import { Dispatch } from 'redux'

export function fetchActiveParties() {
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
    dispatch(activePartiesFetched(activeParties))
  }
}

export function fetchActiveInstances() {
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
    dispatch(activeInstancesFetched(activeInstances))
  }
}

export function fetchActiveLocations() {
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
    dispatch(activeLocationsFetched(activeLocations))
  }
}

export function fetchActiveScenes() {
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
    dispatch(activeScenesFetched(activeScenes))
  }
}

export function fetchChannelUsers() {
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
    dispatch(channelUsersFetched(channelUsers))
  }
}

export function fetchInstanceUsers() {
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
    dispatch(instanceUsersFetched(instanceUsers))
  }
}

export function fetchDailyUsers() {
  return async (dispatch: Dispatch): Promise<any> => {
    const dailyUsers = await client.service('analytics').find({
      query: {
        $limit: 30,
        action: 'dailyUsers'
      }
    })
    dispatch(dailyUsersFetched(dailyUsers))
  }
}

export function fetchDailyNewUsers() {
  return async (dispatch: Dispatch): Promise<any> => {
    const dailyNewUsers = await client.service('analytics').find({
      query: {
        $limit: 30,
        action: 'dailyNewUsers'
      }
    })
    dispatch(dailyNewUsersFetched(dailyNewUsers))
  }
}
