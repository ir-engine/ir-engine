import { Application } from '../../../declarations'
import logger from '../../logger'
import { Instance } from './instance.class'
import instanceDocs from './instance.docs'
import hooks from './instance.hooks'
import createModel from './instance.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    instance: Instance
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Instance(options, app)
  event.docs = instanceDocs
  app.use('instance', event)

  const service = app.service('instance')

  service.hooks(hooks)

  /**
   * A method used to remove specific instance
   *
   * @param data
   * @returns deleted channel
   * @author Vyacheslav Solovjov
   */
  service.publish('removed', async (data): Promise<any> => {
    try {
      const admins = await app.service('user').Model.findAll({
        where: {
          userRole: 'admin'
        }
      })
      const targetIds = admins.map((admin) => admin.id)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            instance: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
