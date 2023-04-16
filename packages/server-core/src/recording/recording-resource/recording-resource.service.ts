// Initializes the `instance-provision` service on path `/instance-provision`
import { Application } from '../../../declarations'
import { RecordingResource } from './recording-resource.class'
import recordingDocs from './recording-resource.docs'
import hooks from './recording-resource.hooks'
import createModel from './recording-resource.model'

// Add this service to the service type index
declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'recording-resource': RecordingResource
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new RecordingResource(options, app)
  event.docs = recordingDocs
  app.use('recording-resource', event)

  const service = app.service('recording-resource')
  service.hooks(hooks)
}
