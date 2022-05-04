import pino from 'pino'

let node = process.env.ELASTIC_HOST || "http://localhost:9200";

const transport = pino.transport({
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
})

transport.on('ready', function () {
  process.exit(0)
})


const logger = pino(transport)

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
