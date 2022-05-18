import { JWTStrategy } from '@feathersjs/authentication'
import { Params } from '@feathersjs/feathers'

// TODO: Why is all this commented out? Can we remove it/clean up?
export class MyJwtStrategy extends JWTStrategy {
  async getEntity(id: string, params: Params): Promise<any> {
    let returned
    try {
      returned = await super.getEntity(id, params)
    } catch (err) {
      returned = {}
    }

    return returned
  }
}
