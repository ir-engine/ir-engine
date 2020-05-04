import { RequestHandler } from 'express'
import ua from 'universal-analytics'
import config from 'config'

// import { Application } from '../declarations'
// Don't remove this comment. It's needed to format import lines nicely.

// eslint-disable-next-line @typescript-eslint/no-empty-function
// export default (app: Application): void => {}

export const googleAnalytics: RequestHandler = (req, res, next) => {
  console.log('TRACKED=====')
  const visitor = ua(config.get('gaTrackingId'), { https: false })
  visitor.pageview('/').send()
  visitor.screenview('Home Screen', 'XRchat').send()
  visitor.event('Page Visit', 'Visted').send()
  next()
}
