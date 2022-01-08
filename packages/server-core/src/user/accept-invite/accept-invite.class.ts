import { BadRequest } from '@feathersjs/errors'
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import logger from '../../logger'
import Paginated from '../../types/PageObject'

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

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which help to find all accept invite and display it
   *
   * @param params number of limit and skip for pagination
   * Number should be passed as query parmas
   * @returns {@Array} all listed invite
   * @author Vyacheslav Solovjov
   */
  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A funtion which display specific accept invite
   *
   * @param id of specific accept invite
   * @param params query which contain passcode
   * @returns {@Object} contains single invite
   * @author Vyacheslav Solovjov
   */

  async get(id: Id, params: Params): Promise<Data> {
    if (params.query!.t) {
      params.query!.passcode = params.query!.t
      delete params.query!.t
    }
    try {
      params.provider = null!
      let invite
      try {
        invite = await this.app.service('invite').get(id, params)
      } catch (err) {}

      if (invite == null) {
        console.log('INVALID INVITE ID')
        return {
          error: 'Invalid Invite ID'
        }
      }

      if (params.query!.passcode !== invite.passcode) {
        console.log('INVALID INVITE PASSCODE')
        return {
          error: 'Invalid Invite Passcode'
        }
      }

      if (invite.identityProviderType != null) {
        let inviteeIdentityProvider
        const inviteeIdentityProviderResult = await this.app.service('identity-provider').find({
          query: {
            type: invite.identityProviderType,
            token: invite.token
          }
        })

        if ((inviteeIdentityProviderResult as any).total === 0) {
          inviteeIdentityProvider = await this.app.service('identity-provider').create(
            {
              type: invite.identityProviderType,
              token: invite.token
            },
            params
          )
        } else {
          inviteeIdentityProvider = (inviteeIdentityProviderResult as any).data[0]
        }
        if (params['identity-provider'] == null) params['identity-provider'] = inviteeIdentityProvider

        if (invite.inviteType === 'friend') {
          const existingRelationshipResult = (await this.app.service('user-relationship').find({
            query: {
              $or: [
                {
                  userRelationshipType: 'requested'
                },
                {
                  userRelationshipType: 'friend'
                }
              ],
              userId: invite.userId,
              relatedUserId: inviteeIdentityProvider.userId
            }
          })) as any

          if ((existingRelationshipResult as any).total === 0) {
            await this.app.service('user-relationship').create(
              {
                userRelationshipType: 'friend',
                userId: invite.userId,
                relatedUserId: inviteeIdentityProvider.userId
              },
              params
            )
          } else {
            await this.app.service('user-relationship').patch(
              existingRelationshipResult.data[0].id,
              {
                userRelationshipType: 'friend'
              },
              params
            )
          }

          const relationshipToPatch = (await this.app.service('user-relationship').find({
            query: {
              $or: [
                {
                  userRelationshipType: 'requested'
                },
                {
                  userRelationshipType: 'friend'
                }
              ],
              userId: inviteeIdentityProvider.userId,
              relatedUserId: invite.userId
            }
          })) as any

          if (relationshipToPatch.data.length > 0)
            await this.app.service('user-relationship').patch(
              relationshipToPatch.data[0].id,
              {
                userRelationshipType: 'friend'
              },
              params
            )
        } else if (invite.inviteType === 'group') {
          const group = await this.app.service('group').get(invite.targetObjectId)

          if (group == null) {
            return new BadRequest('Invalid group ID')
          }

          const { query, ...paramsCopy } = params

          const existingGroupUser = (await this.app.service('group-user').find({
            query: {
              userId: inviteeIdentityProvider.userId,
              groupId: invite.targetObjectId,
              groupUserRank: 'user'
            }
          })) as any

          if (existingGroupUser.total === 0) {
            paramsCopy.skipAuth = true
            await this.app.service('group-user').create(
              {
                userId: inviteeIdentityProvider.userId,
                groupId: invite.targetObjectId
              },
              paramsCopy
            )
          }
        } else if (invite.inviteType === 'party') {
          const party = await this.app.service('party').get(invite.targetObjectId, params)

          if (party == null) {
            return new BadRequest('Invalid party ID')
          }

          await this.app.service('user').patch(inviteeIdentityProvider.userId, {
            partyId: invite.targetObjectId
          })

          const { query, ...paramsCopy } = params

          const existingPartyUser = (await this.app.service('party-user').find({
            query: {
              userId: inviteeIdentityProvider.userId,
              partyId: invite.targetObjectId,
              isOwner: false
            }
          })) as any

          if (existingPartyUser.total === 0) {
            paramsCopy.skipAuth = true
            await this.app.service('party-user').create(
              {
                userId: inviteeIdentityProvider.userId,
                partyId: invite.targetObjectId,
                isOwner: false
              },
              paramsCopy
            )
          }
        }
      } else if (invite.inviteeId != null) {
        const invitee = await this.app.service('user').get(invite.inviteeId)

        if (invitee == null) {
          return new BadRequest('Invalid invitee ID')
        }

        if (params['identity-provider'] == null) params['identity-provider'] = invitee.identityProvider

        if (invite.inviteType === 'friend') {
          const existingRelationshipResult = (await this.app.service('user-relationship').find({
            query: {
              $or: [
                {
                  userRelationshipType: 'requested'
                },
                {
                  userRelationshipType: 'friend'
                }
              ],
              userId: invite.userId,
              relatedUserId: invite.inviteeId
            }
          })) as any

          if ((existingRelationshipResult as any).total === 0) {
            await this.app.service('user-relationship').create(
              {
                userRelationshipType: 'friend',
                userId: invite.userId,
                relatedUserId: invite.inviteeId
              },
              params
            )
          } else {
            await this.app.service('user-relationship').patch(
              existingRelationshipResult.data[0].id,
              {
                userRelationshipType: 'friend'
              },
              params
            )
          }

          const relationshipToPatch = (await this.app.service('user-relationship').find({
            query: {
              $or: [
                {
                  userRelationshipType: 'requested'
                },
                {
                  userRelationshipType: 'friend'
                }
              ],
              userId: invite.inviteeId,
              relatedUserId: invite.userId
            }
          })) as any

          if (relationshipToPatch.data.length > 0)
            await this.app.service('user-relationship').patch(
              relationshipToPatch.data[0].id,
              {
                userRelationshipType: 'friend'
              },
              params
            )
        } else if (invite.inviteType === 'group') {
          const group = await this.app.service('group').get(invite.targetObjectId)

          if (group == null) {
            return new BadRequest('Invalid group ID')
          }

          const { query, ...paramsCopy } = params

          const existingGroupUser = (await this.app.service('group-user').find({
            query: {
              userId: invite.inviteeId,
              groupId: invite.targetObjectId
            }
          })) as any

          if (existingGroupUser.total === 0) {
            paramsCopy.skipAuth = true
            await this.app.service('group-user').create(
              {
                userId: invite.inviteeId,
                groupId: invite.targetObjectId,
                groupUserRank: 'user'
              },
              paramsCopy
            )
          }
        } else if (invite.inviteType === 'party') {
          const party = await this.app.service('party').get(invite.targetObjectId, params)

          if (party == null) {
            return new BadRequest('Invalid party ID')
          }

          await this.app.service('user').patch(invite.inviteeId, {
            partyId: invite.targetObjectId
          })

          const { query, ...paramsCopy } = params

          const existingPartyUser = (await this.app.service('party-user').find({
            query: {
              userId: invite.inviteeId,
              partyId: invite.targetObjectId,
              isOwner: false
            }
          })) as any

          if (existingPartyUser.total === 0) {
            paramsCopy.skipAuth = true
            await this.app.service('party-user').create(
              {
                userId: invite.inviteeId,
                partyId: invite.targetObjectId,
                isOwner: false
              },
              paramsCopy
            )
          }
        }
      }

      params.preventUserRelationshipRemoval = true
      await this.app.service('invite').remove(invite.id, params)
      const token = await (this.app.service('authentication') as any).createAccessToken(
        {},
        { subject: params['identity-provider'].id.toString() }
      )
      return {
        token: token
      }
    } catch (err) {
      logger.error(err)
      return null!
    }
  }

  /**
   * A function for creating invite
   *
   * @param data which will be used for creating new accept invite
   * @param params
   * @author Vyacheslav Solovjov
   */
  async create(data: Data, params: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
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
  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
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
  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   * A function for removing accept invite
   * @param id of specific accept invite
   * @param params
   * @returns id
   * @author Vyacheslav Solovjov
   */
  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }
}
