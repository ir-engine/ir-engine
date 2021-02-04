import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { BadRequest } from '@feathersjs/errors';
import logger from '../../app/logger';

interface Data {}

interface ServiceOptions {}

/**
 * accept invite class for get, create, update and remove user invite
 * 
 */
export class AcceptInvite implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  /**
   * A function which help to find all accept invite and display it
   * 
   * @param params number of limit and skip for pagination
   * Number should be passed as query parmas
   * @returns {@Array} all listed invite 
   * @author Vyacheslav Solovjov
   */
  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  /**
   * A funtion which display specific accept invite 
   * 
   * @param id of specific accept invite
   * @param params query which contain passcode 
   * @returns {@Object} contains single invite 
   * @author Vyacheslav Solovjov
   */

  async get (id: Id, params?: Params): Promise<Data> {
    if (params.query.t) {
      params.query.passcode = params.query.t;
      delete params.query.t;
    }
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

  /**
   * A function for creating invite 
   * 
   * @param data which will be used for creating new accept invite 
   * @param params 
   * @author Vyacheslav Solovjov
   */
  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  /**
   * A function to update accept invite
   * 
   * @param id of specific accept invite 
   * @param data for updating accept invite 
   * @param params 
   * @returns Data
   * @author Vyacheslav Solovjov
   */
  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  /**
   * A function for updating accept invite 
   * 
   * @param id of specific accept invite 
   * @param data for updaing accept invite 
   * @param params 
   * @returns Data
   * @author Vyacheslav Solovjov
   */
  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  /**
   * A function for removing accept invite 
   * @param id of specific accept invite 
   * @param params 
   * @returns id 
   * @author Vyacheslav Solovjov
   */
  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }
}
