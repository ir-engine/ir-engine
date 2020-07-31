import config from '../config'
import { Hook, HookContext } from '@feathersjs/feathers'
import StorageProvider from '../storage/storageprovider'
import { StaticResource } from '../services/static-resource/static-resource.class'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { app, id } = context

    console.log(`Removing Message statuses for removed message ${id}`)
    const result = await app.service('message-status').Model.destroy({
      where: {
        messageId: id
      }
    })

    console.log('Message status removal result:')
    console.log(result)

    return context
  }
}

