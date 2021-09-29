import { SETTING_ANALYIS_DISPLAY } from '../../../actions'

export interface AnalyticsRetriveResponse {
  type: string
  analytics: any[]
}

export const fetchedAnalytics = (analytics: any): AnalyticsRetriveResponse => {
  return {
    type: SETTING_ANALYIS_DISPLAY,
    analytics: analytics
  }
}
