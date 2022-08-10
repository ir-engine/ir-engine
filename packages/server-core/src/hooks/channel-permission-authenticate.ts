import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from './../../declarations'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { params, app } = context
    const loggedInUser = params.user as UserInterface
    const userId = loggedInUser.id
    if (!params.query!.channelId) {
      throw new BadRequest('Must provide a channel ID')
    }
    const channel = await app.service('channel').get(params.query!.channelId)
    if (channel == null) {
      throw new BadRequest('Invalid channel ID')
    }
    if (channel.channelType === 'user') {
      if (channel.userId1 !== userId && channel.userId2 !== userId) {
        throw new Forbidden('You are not a member of that channel')
      }
    } else if (channel.channelType === 'group') {
      const groupUser = await app.service('group-user').Model.findOne({
        where: {
          groupId: channel.groupId,
          userId: userId
        }
      })
      if (groupUser == null) {
        throw new Forbidden('You are not a member of that channel')
      }
    } else if (channel.channelType === 'party') {
      const partyUser = await app.service('party-user').Model.findOne({
        where: {
          partyId: channel.partyId,
          userId: userId
        }
      })
      if (partyUser == null) {
        throw new Forbidden('You are not a member of that channel')
      }
    }
    return context
  }
}
