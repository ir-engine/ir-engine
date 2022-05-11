import pino from 'pino'

const pinoMultiStream = require('pino-multi-stream').multistream
const pinoElastic = require('pino-elasticsearch')
const pretty = require('pino-pretty')

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

const logger = pino(pinoOptions, pinoMultiStream([{ stream: streamToPretty }, { stream: streamToElastic }]))

export default logger
