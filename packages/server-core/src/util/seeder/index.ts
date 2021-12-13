import { GeneralError } from '@feathersjs/errors'
import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { copyDefaultProject, uploadLocalProjectToProvider } from '../../projects/project/project.class'
import { seedApp } from './seeder'

export default function seeder(services: Array<ServicesSeedConfig>) {
  return function () {
    const app = this
    app.seed = async () => {
      try {
        await seedApp(app, services)
      } catch (err) {
        console.log(`Seeding error: ${err}`)
        throw new GeneralError(new Error(err))
      }
      copyDefaultProject()
      await app.service('project')._seedProject('default-project')
      await uploadLocalProjectToProvider('default-project', app)
    }
  }
}
