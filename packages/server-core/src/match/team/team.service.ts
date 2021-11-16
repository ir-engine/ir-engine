import { Team } from './team.class'
import createModel from './team.model'
import hooks from './team.hooks'
import { Team as TeamInterface } from '@xrengine/common/src/interfaces/Team'
import teamDocs from './team.docs'
import { Application } from '@xrengine/server-core/declarations'

// Add this service to the service type index
declare module '@xrengine/server-core/declarations' {
  interface ServiceTypes {
    team: TeamInterface
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const team = new Team(options, app)
  team.docs = teamDocs
  // @ts-ignore
  app.use('team', team)

  // Get our initialized service so that we can register hooks
  const service = app.service('team')

  service.hooks(hooks)
}
