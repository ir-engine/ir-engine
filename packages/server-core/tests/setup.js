const { register } = require('trace-unhandled')
register()

require("ts-node").register({
  project: "./tsconfig.json",
})

process.on('SIGTERM', async (err) => {
  console.log('[Creator Tests]: Server SIGTERM')
  console.log(err)
})
process.on('SIGINT', () => {
  console.log('[Creator Tests]: RECEIVED SIGINT')
  process.exit()
})

//emitted when an uncaught JavaScript exception bubbles
process.on('uncaughtException', (err) => {
  console.log('[Creator Tests]: UNCAUGHT EXCEPTION')
  console.log(err)
  process.exit()
})

//emitted whenever a Promise is rejected and no error handler is attached to it
process.on('unhandledRejection', (reason, p) => {
  console.log('[Creator Tests]: UNHANDLED REJECTION')
  console.log(reason)
  console.log(p)
  process.exit()
})