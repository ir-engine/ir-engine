export const redisSeed = {
  path: 'redis-setting',
  templates: [
    {
      enabled: process.env.REDIS_ENABLED === 'true',
      address: process.env.REDIS_ADDRESS,
      port: process.env.REDIS_PORT,
      password:
        process.env.REDIS_PASSWORD == '' || process.env.REDIS_PASSWORD == null ? null : process.env.REDIS_PASSWORD
    }
  ]
}
