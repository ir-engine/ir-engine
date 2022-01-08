import { Application } from '../../../declarations'
import { GroupUserRank } from './group-user-rank.class'
import groupUserRankDocs from './group-user-rank.docs'
import hooks from './group-user-rank.hooks'
import createModel from './group-user-rank.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'group-user-rank': GroupUserRank
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new GroupUserRank(options, app)
  event.docs = groupUserRankDocs
  app.use('group-user-rank', event)

  const service = app.service('group-user-rank')

  service.hooks(hooks)
}
