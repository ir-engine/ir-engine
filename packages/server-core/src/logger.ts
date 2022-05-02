import pino from 'pino'

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
          index: 'xr-server',
          consistency: 'one',
          node: 'http://elasticsearch:9200'
        }
      }
    ]
  }
})

export default logger
