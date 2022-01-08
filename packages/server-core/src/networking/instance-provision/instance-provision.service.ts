// Initializes the `instance-provision` service on path `/instance-provision`
import { Application } from '../../../declarations'
import logger from '../../logger'
import { InstanceProvision } from './instance-provision.class'
import instanceProvisionDocs from './instance-provision.docs'
import hooks from './instance-provision.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'instance-provision': InstanceProvision
  }
}

export default (app: Application) => {
  const options = {
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new InstanceProvision(options, app)
  event.docs = instanceProvisionDocs
  app.use('instance-provision', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('instance-provision')

  service.hooks(hooks)

  /**
   * A method which is used to create instance provinsion
   *
   * @param data which is parsed to create instance provinsion
   * @returns created instance provinsion
   * @author Vyacheslav Solovjov
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      return app.channel(`userIds/${data.userId}`).send({
        ipAddress: data.ipAddress,
        port: data.port,
        locationId: data.locationId,
        sceneId: data.sceneId,
        channelId: data.channelId
      })
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
