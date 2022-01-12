import { Params } from '@feathersjs/feathers'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { NotAuthenticated } from '@feathersjs/errors'

export class MyLocalStrategy extends LocalStrategy {
  async findEntity(username: string, params: Params): Promise<any> {
    const { service, errorMessage } = this.configuration
    if (!username) {
      throw new NotAuthenticated(errorMessage)
    }

    const entityService = this.app?.service(service)!

    const result = (await entityService.find({
      query: {
        token: username,
        type: 'password'
      }
    })) as any

    const identityProviders = result.data

    if (identityProviders.length === 0) {
      throw new NotAuthenticated(errorMessage)
    }

    const identityProvider = identityProviders[0]

    return { ...identityProvider }
  }

  // async comparePassword (user: any, password: string): Promise<any> {
  //   if (user.password === password) {
  //     return user
  //   }

  //   throw new NotAuthenticated('Invalid password')
  // }
}
