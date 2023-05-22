import { isDev } from '@etherealengine/common/src/config'

import { Application } from '../../declarations'
import { elasticOnlyLogger } from '../ServerLogger'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    '/api/log': any
  }
}

// Receive client-side log events (only active when APP_ENV != 'development')
export default (app: Application): void => {
  app.use(
    '/api/log',
    {
      create: () => {
        return
      }
    },
    {
      koa: {
        before: [
          async (ctx: any, next) => {
            const { msg, ...mergeObject } = ctx.body
            if (!isDev) elasticOnlyLogger.info({ user: ctx.params?.user, ...mergeObject }, msg)
            await next()
            ctx.status = 204
            return
          }
        ]
      }
    }
  )
}
