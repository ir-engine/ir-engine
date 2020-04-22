import logger from './logger'
import app from './app'

// @ts-ignore
import seederConfig from './seeder-config'
// @ts-ignore
import seeder from 'feathers-seeder'
const port = app.get('port')
app.configure(seeder(seederConfig))
// @ts-ignore
  .seed()
  .then(() => {
    const server = app.listen(port)

    process.on('unhandledRejection', (reason, p) =>
      logger.error('Unhandled Rejection at: Promise ', p, reason)
    )

    server.on('listening', () =>
      logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
    )
  }).catch((err: string) => {
    console.log(('Error seeding db: ').concat(err))
  })
