import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BadRequest } from '@feathersjs/errors';
import logger from '../../app/logger';

interface Data {}

interface ServiceOptions {}

export class AcceptInvite implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    console.log('ACCEPT_INVITE');
    console.log(id);
    console.log(params);
    try {
      params.provider = null;
      const invite = await this.app.service('invite').get(id, params);

      if (invite == null) {
        console.log('INVALID INVITE ID');
        return new BadRequest('Invalid invite ID');
      }

      if (params.query.passcode !== invite.passcode) {
        console.log('INVALID INVITE PASSCODE');
        return new BadRequest('Invalid passcode');
      }

      if (invite.identityProviderType != null) {
        let inviteeIdentityProvider;
        const inviteeIdentityProviderResult = await this.app.service('identity-provider').find({
          query: {
            type: invite.identityProviderType,
            token: invite.token
          }
        });

        if ((inviteeIdentityProviderResult as any).total === 0) {
          inviteeIdentityProvider = await this.app.service('identity-provider').create({
            type: invite.identityProviderType,
            token: invite.token
          }, params);
        } else {
          inviteeIdentityProvider = (inviteeIdentityProviderResult as any).data[0];
        }

        if (invite.inviteType === 'friend') {
          let relationshipToPatch;
          const existingRelationshipResult = await this.app.service('user-relationship').find({
            query: {
              userRelationshipType: invite.inviteType,
              userId: invite.userId,
              relatedUserId: inviteeIdentityProvider.userId
            }
          });

          if ((existingRelationshipResult as any).total === 0) {
            relationshipToPatch = await this.app.service('user-relationship').create({
              userRelationshipType: invite.inviteType,
              userId: invite.userId,
              relatedUserId: (inviteeIdentityProvider).userId
            }, params);
          } else {
            relationshipToPatch = (existingRelationshipResult as any).data[0];
          }

          await this.app.service('user-relationship').patch(relationshipToPatch.id, {
            userRelationshipType: invite.inviteType
          }, params);
        } else if (invite.inviteType === 'group') {
          const group = await this.app.service('group').get(invite.targetObjectId);

          if (group == null) {
            return new BadRequest('Invalid group ID');
          }

          const { query, ...paramsCopy } = params;
          paramsCopy.skipAuth = true;
          await this.app.service('group-user').create({
            userId: inviteeIdentityProvider.userId,
            groupId: invite.targetObjectId,
            groupUserRank: 'user'
          }, paramsCopy);
        } else if (invite.inviteType === 'party') {
          const party = await this.app.service('party').get(invite.targetObjectId, params);

          if (party == null) {
            return new BadRequest('Invalid party ID');
          }

          await this.app.service('user').patch(inviteeIdentityProvider.userId, {
            partyId: invite.targetObjectId
          });

          const { query, ...paramsCopy } = params;
          paramsCopy.skipAuth = true;
          await this.app.service('party-user').create({
            userId: inviteeIdentityProvider.userId,
            partyId: invite.targetObjectId,
            isOwner: false
          }, paramsCopy);
        }
      } else if (invite.inviteeId != null) {
        const invitee = await this.app.service('user').get(invite.inviteeId);

        if (invitee == null) {
          return new BadRequest('Invalid invitee ID');
        }

        if (invite.inviteType === 'friend') {
          const existingRelationshipResult = await this.app.service('user-relationship').find({
            query: {
              userRelationshipType: invite.inviteType,
              userId: invite.userId,
              relatedUserId: invite.inviteeId
            }
          });

          if ((existingRelationshipResult as any).total > 0) {
            await this.app.service('user-relationship').patch((existingRelationshipResult as any).data[0].id, {
              userRelationshipType: invite.inviteType
            }, params);
          }
        } else if (invite.inviteType === 'group') {
          const group = await this.app.service('group').get(invite.targetObjectId);

          if (group == null) {
            return new BadRequest('Invalid group ID');
          }

          const { query, ...paramsCopy } = params;
          paramsCopy.skipAuth = true;
          await this.app.service('group-user').create({
            userId: invite.inviteeId,
            groupId: invite.targetObjectId,
            groupUserRank: 'user'
          }, paramsCopy);
        } else if (invite.inviteType === 'party') {
          const party = await this.app.service('party').get(invite.targetObjectId, params);

          if (party == null) {
            return new BadRequest('Invalid party ID');
          }

          await this.app.service('user').patch(invite.inviteeId, {
            partyId: invite.targetObjectId
          });

          const { query, ...paramsCopy } = params;
          paramsCopy.skipAuth = true;
          await this.app.service('party-user').create({
            userId: invite.inviteeId,
            partyId: invite.targetObjectId,
            isOwner: false
          }, paramsCopy);
        }
      }

      await this.app.service('invite').remove(invite.id, params);
    } catch (err) {
      logger.error(err);
    }
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current, params)));
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
