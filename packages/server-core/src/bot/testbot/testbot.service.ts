import { Application } from '../../../declarations'
import { getTestbotPod } from './testbot-helper'

export default (app: Application): void => {
  app.use('testbot', {
    get: async () => {
      const result = await getTestbotPod(app)
      if (result) {
        const response = result.items.map((item) => {
          return {
            name: item.metadata.name,
            status: item.status.phase
          }
        })
        return response
      }

      return []
    }
  })

  // TODO: Need to put authenticate hooks
}
