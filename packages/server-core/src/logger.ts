import pino from 'pino'

let node = process.env.ELASTIC_HOST || "http://localhost:9200";

const pinoElastic = require('pino-elasticsearch')

const streamToElastic = pinoElastic({
  index: 'an-index',
  consistency: 'one',
  node: 'http://localhost:9200',
  'es-version': 7,
  'flush-bytes': 1000
})

const logger = pino({ level: 'info' }, streamToElastic);

// const logger = pino({
//   transport: {
//     targets: [
//       {
//         level: 'debug',
//         target: 'pino-pretty',
//         options: {
//           colorize: true,
//           translateTime: true
//         }
//       },
//       {
//         level: 'debug',
//         target: 'pino-elasticsearch',
//         options: {
//           index: 'xr-engine',
//           consistency: 'one',
//           node: node
//         }
//       }
//     ]
//   }
// })

export default logger
