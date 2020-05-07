// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import ua from 'universal-analytics'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    if (context.method === 'remove') return context
    if (!context.params.user) {
      // send a anonymous user's analytics
      const visitor = ua(context.app.get('gaTrackingId'), { https: false })
      visitor.pageview(context.service).send()
      visitor.event(context.method, 'Requeset').send()
    } else {
      // send the user's analytics
      const visitor = ua(
        context.app.get('gaTrackingId'),
        context.params.user._id,
        { https: false }
      )
      visitor.pageview(context.service).send()
      visitor.event(context.method, 'Requeset').send()
    }
    return context
  }
}
