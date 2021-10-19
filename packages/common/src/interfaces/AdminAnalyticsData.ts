export interface AdminAnalytics {
  createdAt: string
  count: number
}

export interface AdminAnalyticsResult {
  data: AdminAnalytics[]
  total: number
}
