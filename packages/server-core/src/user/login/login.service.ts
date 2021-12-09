// Initializes the `login` service on path `/login`
import { Application } from '../../../declarations'
import { Login } from './login.class'
import hooks from './login.hooks'
import config from '../../appconfig'
import logger from '../../logger'
import loginDocs from './login.docs'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    login: Login
  }
}

async function redirect(req, res, next, app): Promise<any> {
  try {
    const [dbClientConfig] = await app.service('client-setting').find()
    const clientConfig = dbClientConfig || config.client

    if (res.data.error) {
      return res.redirect(`${clientConfig.url}/?error=${res.data.error as string}`)
    }
    return res.redirect(`${clientConfig.url}/auth/magiclink?type=login&token=${res.data.token as string}`)
  } catch (err) {
    logger.error(err)
    throw err
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
  const event = new Login(options, app)
  event.docs = loginDocs
  app.use('login', event, (req, res, next) => redirect(req, res, next, app))

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('login')

  service.hooks(hooks)
}
