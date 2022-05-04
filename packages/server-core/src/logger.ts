import pino from 'pino'
import config from '@xrengine/server-core/src/appconfig'

let node = config.logging.elastic_host;
console.log(node);


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
