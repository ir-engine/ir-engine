import { Application } from '../../../declarations'
import { getTestbotPod, runTestbotJob } from './testbot-helper'
import hooks from './testbot.hooks'

export default (app: Application): void => {
  app.use('testbot', {
    get: async () => {
      const result = await getTestbotPod(app)
      return result
    },
    create: async () => {
      const result = await runTestbotJob(app)
      return result
    }
  })

  const service = app.service('testbot')

  service.hooks(hooks)
}
