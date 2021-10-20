import '@feathersjs/transport-commons'
import { Application } from '@standardcreative/server-core/declarations'

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('login', (authResult: any, { connection }: any) => {
    const identityProvider = authResult['identity-provider'] || connection['identity-provider']
    if (identityProvider) app.channel(`userIds/${identityProvider.userId as string}`).join(connection)
  })

  app.on('logout', (authResult: any, { connection }: any) => {
    const identityProvider = authResult['identity-provider'] || connection['identity-provider']
    if (identityProvider) app.channel(`userIds/${identityProvider.userId as string}`).leave(connection)
  })
}
