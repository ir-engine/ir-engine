/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// Initializes the `login` service on path `/login`
import { loginMethods, loginPath } from '@ir-engine/common/src/schemas/user/login.schema'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { LoginService } from './login.class'
import loginDocs from './login.docs'
import hooks from './login.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [loginPath]: LoginService
  }
}

async function redirect(ctx, next) {
  try {
    const data = ctx.body

    let redirectQuery = ''
    let redirectPath = ''
    let originPath = config.client.url

    if (ctx.query?.redirectUrl) {
      redirectQuery = `&path=${ctx.query.redirectUrl}`
      redirectPath = ctx.query.redirectUrl
      originPath = new URL(ctx.query.redirectUrl).origin
    }

    if (data.error) return ctx.redirect(`${redirectPath || originPath}/?error=${data.error as string}`)
    if (data.promptForConnection) {
      return ctx.redirect(
        `${originPath}/auth/magiclink?loginId=${data.loginId}&loginToken=${
          data.loginToken as string
        }&promptForConnection=true&associateEmail=${data.associateEmail}${redirectQuery}`
      )
    } else return ctx.redirect(`${originPath}/auth/magiclink?type=login&token=${data.token as string}${redirectQuery}`)
  } catch (err) {
    logger.error(err)
    throw err
  }
  return next()
}

export default (app: Application): void => {
  app.use(loginPath, new LoginService(app), {
    // A list of all methods this service exposes externally
    methods: loginMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: loginDocs,
    koa: { after: [redirect] }
  })

  const service = app.service(loginPath)
  service.hooks(hooks)
}
