import { Preset } from './preset.class'
import createModel from './preset.model'
import hooks from './preset.hooks'
import { PresetTeam as PresetInterface } from '@xrengine/common/src/interfaces/PresetTeam'
import presetDocs from './preset.docs'
import { Application } from '@xrengine/server-core/declarations'

// Add this service to the service type index
declare module '@xrengine/server-core/declarations' {
  interface ServiceTypes {
    preset: PresetInterface
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const preset = new Preset(options, app)
  preset.docs = presetDocs
  // @ts-ignore
  app.use('preset', preset)

  // Get our initialized service so that we can register hooks
  const service = app.service('preset')

  service.hooks(hooks)
}
