import { GeneralError } from '@feathersjs/errors'
import { copyDefaultProject, uploadLocalProjectToProvider } from '../../projects/project/project.class'

import Seeder from './seeder'

export default function seeder(opts = {}) {
  if (opts === false || (opts as any).disabled === true) {
    return function () {
      this.seed = () => {
        console.log('Seeder is disabled, not modifying database.')

        return Promise.resolve([])
      }
    }
  }

  if (!((opts as any).services instanceof Array)) {
    throw new Error('You must include an array of services to be seeded.')
  }

  return function () {
    const app = this
    const seeder = new Seeder(app, opts)
    app.seed = async () => {
      copyDefaultProject()
      await uploadLocalProjectToProvider('default-project', app)
      try {
        await seeder.seedApp()
      } catch (err) {
        console.log(`Seeding error: ${err}`)
        throw new GeneralError(new Error(err))
      }
    }
  }
}
