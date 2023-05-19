// Initializes the `login` service on path `/login`
import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { Login } from './login.class'
import loginDocs from './login.docs'
import hooks from './login.hooks'

// Add this service to the service type index
declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    login: Login
  }
}

async function redirect(ctx, next) {
  try {
    const { data } = ctx
    if (data.error) {
      return ctx.redirect(`${config.client.url}/?error=${data.error as string}`)
    }
    return ctx.redirect(`${config.client.url}/auth/magiclink?type=login&token=${data.token as string}`)
  } catch (err) {
    logger.error(err)
    throw err
  }
  return next()
}

export default (app: Application) => {
  const options = {
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Login(options, app)
  event.docs = loginDocs
  app.use('login', event, { koa: { after: [redirect] } })
  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('login')

  service.hooks(hooks)
}
