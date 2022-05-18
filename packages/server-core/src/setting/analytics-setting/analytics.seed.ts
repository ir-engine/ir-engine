export const analyticsSeed = {
  path: 'analytics-setting',
  templates: [
    {
      port: process.env.ANALYTICS_PORT || 3030,
      processInterval: process.env.ANALYTICS_PROCESS_INTERVAL_SECONDS || 30
    }
  ]
}
