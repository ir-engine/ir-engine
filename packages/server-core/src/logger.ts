import pino from 'pino'
import pinoElastic from 'pino-elasticsearch'
import pinoMs from 'pino-multi-stream'
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

const pinoOptions = {}

const logger = pino(pinoOptions, pinoMs.multistream([{ stream: streamToPretty }, { stream: streamToElastic }])).child({
  component: 'server-core'
})

export default logger
