import pino from 'pino'

let node = process.env.ELASTIC_HOST_DEV
if (process.env.APP_ENV === 'production') {
  node = process.env.ELASTIC_HOST_PROD
}

const logger = pino({
  transport: {
    targets: [
      {
        level: 'debug',
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: true
        }
      },
      {
        level: 'debug',
        target: 'pino-elasticsearch',
        options: {
          index: 'xr-engine',
          consistency: 'one',
          node: node
        }
      }
    ]
  }
})

export default logger
