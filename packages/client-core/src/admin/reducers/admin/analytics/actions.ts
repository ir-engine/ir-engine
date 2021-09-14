export const ACTIVE_PARTIES_FETCHED = 'ACTIVE_PARTIES_FETCHED'
export const INSTANCE_USERS_FETCHED = 'INSTANCE_USERS_FETCHED'
export const CHANNEL_USERS_FETCHED = 'CHANNEL_USERS_FETCHED'
export const ACTIVE_INSTANCES_FETCHED = 'ACTIVE_INSTANCES_FETCHED'
export const ACTIVE_LOCATIONS_FETCHED = 'ACTIVE_LOCATIONS_FETCHED'
export const ACTIVE_SCENES_FETCHED = 'ACTIVE_SCENES_FETCHED'
export const DAILY_USERS_FETCHED = 'DAILY_USERS_FETCHED'
export const DAILY_NEW_USERS_FETCHED = 'DAILY_NEW_USERS_FETCHED'

export interface AnalyticsFetchedAction {
  type: string
  analytics: any
}

export function activePartiesFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: ACTIVE_PARTIES_FETCHED,
    analytics: analytics
  }
}

export function activeInstancesFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: ACTIVE_INSTANCES_FETCHED,
    analytics: analytics
  }
}

export function channelUsersFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: CHANNEL_USERS_FETCHED,
    analytics: analytics
  }
}

export function instanceUsersFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: INSTANCE_USERS_FETCHED,
    analytics: analytics
  }
}

export function activeLocationsFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: ACTIVE_LOCATIONS_FETCHED,
    analytics: analytics
  }
}

export function activeScenesFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: ACTIVE_SCENES_FETCHED,
    analytics: analytics
  }
}

export function dailyUsersFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: DAILY_USERS_FETCHED,
    analytics: analytics
  }
}

export function dailyNewUsersFetched(analytics: any): AnalyticsFetchedAction {
  return {
    type: DAILY_NEW_USERS_FETCHED,
    analytics: analytics
  }
}
