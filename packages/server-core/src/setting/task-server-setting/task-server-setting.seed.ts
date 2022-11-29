export const taskServerSeed = {
  path: 'task-server-setting',
  templates: [
    {
      port: process.env.TASKSERVER_PORT || 3030,
      processInterval: process.env.TASKSERVER_PROCESS_INTERVAL_SECONDS || 30
    }
  ]
}
