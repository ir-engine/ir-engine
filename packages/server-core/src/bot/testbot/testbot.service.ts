import { Application } from '../../../declarations'

export default (app: Application): void => {
  app.use('testbot', {
    create: () => {
      return { name: 'Hello' }
    }
  })

  // TODO: Need to put authenticate hooks
}
