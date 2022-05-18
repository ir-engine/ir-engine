import { Application } from '../../../declarations'
import { InstanceAttendance } from './instance-attendance.class'
import createModel from './instance-attendance.model'
import hooks from './instance-attendance.hooks'
import instanceAttendanceDocs from './instance-attendance.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'instance-attendance': InstanceAttendance
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
  const event = new InstanceAttendance(options, app)
  event.docs = instanceAttendanceDocs
  app.use('instance-attendance', event)

  const service = app.service('instance-attendance')

  service.hooks(hooks)
}
