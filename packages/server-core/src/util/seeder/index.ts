import { GeneralError } from '@feathersjs/errors'
import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { copyDefaultProject, uploadLocalProjectToProvider } from '../../projects/project/project.class'
import { seedApp } from './seeder'

export default function seeder(services: Array<ServicesSeedConfig>) {
  return function () {
    const app = this
    app.seed = async () => {
      copyDefaultProject()
      await uploadLocalProjectToProvider('default-project', app)
      try {
        await seedApp(app, services)
      } catch (err) {
        console.log(`Seeding error: ${err}`)
        throw new GeneralError(new Error(err))
      }
    }
  }
}
