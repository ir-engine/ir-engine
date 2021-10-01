export const analyticsSeed = {
  path: 'analytics-setting',
  randomize: false,
  templates: [
    {
      enabled: true,
      port: 3032,
      processInterval: process.env.ANALYTICS_PROCESS_INTERVAL_SECONDS || 30
    }
  ]
}
