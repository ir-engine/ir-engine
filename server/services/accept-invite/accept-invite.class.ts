import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BadRequest } from '@feathersjs/errors'

interface Data {}

interface ServiceOptions {}

export class AcceptInvite implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    const invite = await this.app.service('invite').get(id)

    if (invite == null) {
      return new BadRequest('Invalid invite ID')
    }

    if (params.passcode !== invite.passcode) {
      return new BadRequest('Invalid passcode')
    }

    if (invite.identityProviderType != null) {
      const inviteeIdentityProvider = await this.app.service('identity-provider').find({
        type: invite.identityProviderType,
        token: invite.token
      })

      if (inviteeIdentityProvider == null) {
        const newIdentityProvider = await this.app.service('identity-provider').create({
          token: invite.token,
          type: invite.identityProviderType
        }, params)

        if (invite.inviteType === 'friend') {
          await this.app.service('user-relationship').create({
            userRelationshipType: invite.inviteType,
            userId: invite.userId,
            relatedUserId: newIdentityProvider.userId
          }, {})

          await this.app.service('user-relationship').update(invite.userId, {
            userRelationshipType: invite.inviteType,
            userId: newIdentityProvider.userId
          })        }
      }
      else {

      }
    }

    if (invite.inviteType === 'friend') {

    }
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
