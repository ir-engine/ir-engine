import { BadRequest } from '@feathersjs/errors'
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import Paginated from '../../types/PageObject'

interface Data {}

interface ServiceOptions {}

interface AcceptInviteParams extends Params {
  skipAuth?: boolean
  preventUserRelationshipRemoval?: boolean
}

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
   */
  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A funtion which display specific accept invite
   *
   * @param id of specific accept invite
   * @param params query which contain passcode
   * @returns {@Object} contains single invite
   */

  async get(id: Id, params?: AcceptInviteParams): Promise<Data> {
    let inviteeIdentityProvider
    let returned = {} as any
    if (!params) params = {}
    if (params.query?.t) {
      params.query.passcode = params.query.t
      delete params.query.t
    }
    try {
      params.provider = null!
      let invite
      try {
        invite = await this.app.service('invite').Model.findOne({
          where: {
            id: id
          }
        })
      } catch (err) {}

      if (invite == null) {
        logger.info('INVALID INVITE ID')
        return {
          error: 'Invalid Invite ID'
        }
      }

      if (params.query!.passcode !== invite.passcode) {
        logger.info('INVALID INVITE PASSCODE')
        return {
          error: 'Invalid Invite Passcode'
        }
      }

      const dateNow = new Date()

      if (invite.timed && invite.startTime && dateNow < invite.startTime) {
        logger.info(`Invite ${invite.id} accessed before start time ${dateNow}`)
        return {
          error: 'Invite accessed too early'
        }
      }

      if (invite.timed && invite.endTime && dateNow > invite.endTime) {
        logger.info(`Invite ${invite.id} accessed after end time ${dateNow}`)
        return {
          error: 'Invite has expired'
        }
      }

      if (invite.identityProviderType != null) {
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
      } else if (invite.inviteeId != null) {
        const invitee = await this.app.service('user').get(invite.inviteeId)

        if (invitee == null || invitee.identity_providers == null || invitee.identity_providers.length === 0) {
          throw new BadRequest('Invalid invitee ID')
        }

        inviteeIdentityProvider = invitee.identity_providers[0]
      }

      if (params['identity-provider'] == null) params['identity-provider'] = inviteeIdentityProvider

      if (invite.makeAdmin) {
        const existingAdminScope = await this.app.service('scope').find({
          query: {
            userId: inviteeIdentityProvider.userId,
            type: 'admin:admin'
          }
        })
        if (existingAdminScope.total === 0)
          await this.app.service('scope').create({
            userId: inviteeIdentityProvider.userId,
            type: 'admin:admin'
          })
      }

      if (invite.inviteType === 'friend') {
        const inviter = await this.app.service('user').Model.findOne({ where: { id: invite.userId } })

        if (inviter == null) {
          await this.app.service('invite').remove(invite.id)
          throw new BadRequest('Invalid user ID')
        }

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
        const group = await this.app.service('group').Model.findOne({ where: { id: invite.targetObjectId } })

        if (group == null) {
          await this.app.service('invite').remove(invite.id)
          throw new BadRequest('Invalid group ID')
        }

        const { query, ...paramsCopy } = params

        const existingGroupUser = (await this.app.service('group-user').find({
          query: {
            userId: inviteeIdentityProvider.userId,
            groupId: invite.targetObjectId
          }
        })) as any

        if (existingGroupUser.total === 0) {
          paramsCopy.skipAuth = true
          await this.app.service('group-user').create(
            {
              userId: inviteeIdentityProvider.userId,
              groupId: invite.targetObjectId,
              groupUserRank: 'owner'
            },
            paramsCopy
          )
        }
      } else if (invite.inviteType === 'party') {
        const party = await this.app.service('party').Model.findOne({ where: { id: invite.targetObjectId } })

        if (party == null) {
          await this.app.service('invite').remove(invite.id)
          return new BadRequest('Invalid party ID')
        }

        const patchUser: any = { partyId: invite.targetObjectId }
        await this.app.service('user').patch(inviteeIdentityProvider.userId, {
          ...patchUser
        })

        const { query, ...paramsCopy } = params

        const existingPartyUser = await this.app.service('party-user').Model.count({
          where: {
            userId: inviteeIdentityProvider.userId,
            partyId: invite.targetObjectId,
            isOwner: false
          }
        })

        if (existingPartyUser === 0) {
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

        const ownerResult = await this.app.service('party-user').find({
          query: {
            partyId: invite.targetObjectId,
            isOwner: true
          },
          sequelize: {
            include: [
              {
                model: this.app.service('user').Model
              }
            ]
          }
        })

        const owner = ownerResult.data[0]

        if (owner && owner.user?.instanceId) {
          const instance = await this.app.service('instance').get(owner.user.instanceId, {
            sequelize: {
              include: [
                {
                  model: this.app.service('location').Model
                }
              ]
            }
          })
          returned.locationName = instance.location.slugifiedName
          returned.instanceId = owner.user.instanceId
          returned.inviteCode = owner.user.inviteCode
        }
      }

      params.preventUserRelationshipRemoval = true
      if (invite.deleteOnUse) await this.app.service('invite').remove(invite.id, params)

      returned.token = await this.app
        .service('authentication')
        .createAccessToken({}, { subject: params['identity-provider'].id.toString() })

      if (invite.inviteType === 'location' || invite.inviteType === 'instance') {
        let instance =
          invite.inviteType === 'instance' ? await this.app.service('instance').get(invite.targetObjectId) : null
        const locationId = instance ? instance.locationId : invite.targetObjectId
        const location = await this.app.service('location').get(locationId)
        returned.locationName = location.slugifiedName
        if (instance) returned.instanceId = instance.id

        if (location.location_setting?.locationType === 'private') {
          const userId = inviteeIdentityProvider.userId
          if (!location.location_authorized_users?.find((authUser) => authUser.userId === userId))
            await this.app.service('location-authorized-user').create({
              locationId: location.id,
              userId: userId
            })
        }
        if (invite.spawnDetails) {
          const spawnDetails = JSON.parse(invite.spawnDetails)
          if (invite.spawnType === 'inviteCode') returned.inviteCode = spawnDetails.inviteCode
          if (invite.spawnType === 'spawnPoint') returned.spawnPoint = spawnDetails.spawnPoint
          if (invite.spawnType === 'spectate') returned.spectate = spawnDetails.spectate
        }
      }

      return returned
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  /**
   * A function for creating invite
   *
   * @param data which will be used for creating new accept invite
   * @param params
   */
  async create(data: Data, params?: Params): Promise<Data> {
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
   */
  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   * A function for updating accept invite
   *
   * @param id of specific accept invite
   * @param data for updaing accept invite
   * @param params
   * @returns Data
   */
  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   * A function for removing accept invite
   * @param id of specific accept invite
   * @param params
   * @returns id
   */
  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
