import pino from 'pino'

let node = "http://localhost:9200"
if (process.env.APP_ENV === 'production') {
  node = "http://elasticsearch:9200"
}
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
}).error(err => {
  console.log(err);
  
})

export default logger
