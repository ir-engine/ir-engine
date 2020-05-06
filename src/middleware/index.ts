// import { Response, Request, NextFunction } from 'express'
// import ua from 'universal-analytics'
// import logger from './../logger'

import { Application } from '../declarations'
// Don't remove this comment. It's needed to format import lines nicely.

// eslint-disable-next-line @typescript-eslint/no-empty-function
export default (app: Application): void => {
  // app.use(async (req: Request, res: Response, next: NextFunction) => {
  //   const visitor = ua(app.get('gaTrackingId'), { https: false })
  //   visitor.pageview(req.path).send()
  //   visitor.screenview('Home Screen', 'XRchat').send()
  //   visitor.event(req.method, 'Requeset').send()
  //   logger.info('Tracked..............')
  //   next()
  // })
}
