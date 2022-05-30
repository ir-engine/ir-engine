import pino from 'pino'
import pinoElastic from 'pino-elasticsearch'
import pretty from 'pino-pretty'

let node = process.env.ELASTIC_HOST || 'http://localhost:9200'

const streamToPretty = pretty({
  colorize: true
})

const streamToElastic = pinoElastic({
  index: 'xr-engine',
  consistency: 'one',
  node: node,
  'es-version': 7,
  'flush-bytes': 1000
})

var streams = [
    streamToPretty,
    streamToElastic
]

var logger = pino({
  level: 'debug'
}, pino.multistream(streams))

export default logger