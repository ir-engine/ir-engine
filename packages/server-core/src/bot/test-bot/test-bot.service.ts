import { Application } from '../../../declarations'

export default (app: Application): void => {
  app.use('test-bot', {
    create: () => {
      return { name: 'Hello' }
    }
  })

  // TODO: Need to put authenticate hooks
}
