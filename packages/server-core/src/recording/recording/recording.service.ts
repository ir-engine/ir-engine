// Initializes the `instance-provision` service on path `/instance-provision`
import { Application } from '../../../declarations'
import { Recording } from './recording.class'
import recordingDocs from './recording.docs'
import hooks from './recording.hooks'
import createModel from './recording.model'

// Add this service to the service type index
declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    recording: Recording
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Recording(options, app)
  event.docs = recordingDocs
  app.use('recording', event)

  const service = app.service('recording')
  service.hooks(hooks)
}
