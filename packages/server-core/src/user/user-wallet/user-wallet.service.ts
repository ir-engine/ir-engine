import { Application } from '../../../declarations'
import { UserWallet } from './user-wallet.class'
import createModel from './user-wallet.model'
import hooks from './user-wallet.hooks'
import userWalletDocs from './user-wallet.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'user-trade': UserWallet
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author DRC
   */
  const event = new UserWallet(options, app)
  event.docs = userWalletDocs
  app.use('user-wallet', event)

  const service = app.service('user-wallet')

  service.hooks(hooks)
}
