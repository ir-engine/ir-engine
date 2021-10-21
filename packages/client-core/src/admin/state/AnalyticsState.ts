import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

import { AnalyticsActionType } from './AnalyticsActions'
export const ANALYTICS_PAGE_LIMIT = 100

const state = createState({
  activeInstances: [],
  activeParties: [],
  instanceUsers: [],
  channelUsers: [],
  activeLocations: [],
  activeScenes: [],
  dailyUsers: [],
  dailyNewUsers: []
})

export const receptor = (action: AnalyticsActionType): any => {
  let result: any, updateMap: any, date: Date
  state.batch((s) => {
    switch (action.type) {
      case 'ACTIVE_INSTANCES_FETCHED':
        result = action.analytics
        return s.merge({
          activeInstances: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
      case 'ACTIVE_PARTIES_FETCHED':
        result = action.analytics
        return s.merge({
          activeParties: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
      case 'ACTIVE_LOCATIONS_FETCHED':
        result = action.analytics
        return s.merge({
          activeLocations: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
      case 'ACTIVE_SCENES_FETCHED':
        result = action.analytics
        return s.merge({
          activeScenes: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
      case 'CHANNEL_USERS_FETCHED':
        result = action.analytics
        return s.merge({
          channelUsers: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
      case 'INSTANCE_USERS_FETCHED':
        result = action.analytics
        return s.merge({
          instanceUsers: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
      case 'DAILY_NEW_USERS_FETCHED':
        result = action.analytics
        return s.merge({
          dailyNewUsers: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
      case 'DAILY_USERS_FETCHED':
        result = action.analytics
        return s.merge({
          dailyUsers: result.data
            .map((item) => {
              return [new Date(item.createdAt).getTime(), item.count]
            })
            .reverse()
        })
    }
  }, action.type)
}

export const accessAnalyticsState = () => state

export const useAnalyticsState = () => useState(state) as any as typeof state
