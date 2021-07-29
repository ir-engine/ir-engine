import { GeneralError } from '@feathersjs/errors'

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
    app.seed = () => {
      return seeder
        .seedApp()
        .then()
        .catch((err) => {
          console.log(`Seeding error: ${err}`)

          throw new GeneralError(new Error(err))
        })
    }
  }
}
