import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { Invite as InviteType } from '@xrengine/common/src/interfaces/Invite'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../declarations'
import config from '../appconfig'
import logger from '../ServerLogger'
import Page from '../types/PageObject'
import { getInviteLink, sendEmail, sendSms } from '../user/auth-management/auth-management.utils'
import { UserRelationshipDataType } from '../user/user-relationship/user-relationship.class'
import { UserParams } from '../user/user/user.class'

export type InviteDataType = InviteType

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'invite')

async function generateEmail(
  app: Application,
  result: InviteDataType,
  toEmail: string,
  inviteType: string,
  inviterUsername: string,
  targetObjectId?: string
): Promise<void> {
  let groupName, locationName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode)

  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-email-invite-${inviteType}.pug`)

  if (inviteType === 'group') {
    const group = await app.service('group').get(targetObjectId!)
    groupName = group.name
  }

  if (inviteType === 'location') {
    const location = await app.service('location').get(targetObjectId!)
    locationName = location.name
  }

  if (inviteType === 'instance') {
    const instance = await app.service('instance').get(targetObjectId!)
    const location = await app.service('location').get(instance.locationId)
    locationName = location.name
  }

  const compiledHTML = pug.compileFile(templatePath)({
    logo: config.client.logo,
    title: config.client.title,
    groupName: groupName,
    locationName: locationName,
    inviterUsername: inviterUsername,
    hashLink
  })
  const mailSender = config.email.from
  const email = {
    from: mailSender,
    to: toEmail,
    subject: config.client.title + ' ' + (config.email.subject[inviteType] || 'Invitation'),
    html: compiledHTML
  }

  return await sendEmail(app, email)
}

async function generateSMS(
  app: Application,
  result: InviteDataType,
  mobile: string,
  inviteType: string,
  inviterUsername: string,
  targetObjectId?: string
): Promise<void> {
  let groupName, locationName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode)
  if (inviteType === 'group') {
    const group = await app.service('group').get(targetObjectId!)
    groupName = group.name
  }

  if (inviteType === 'location') {
    const location = await app.service('location').get(targetObjectId!)
    locationName = location.name
  }

  if (inviteType === 'instance') {
    const instance = await app.service('instance').get(targetObjectId!)
    const location = await app.service('location').get(instance.locationId)
    locationName = location.name
  }
  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-sms-invite-${inviteType}.pug`)
  const compiledHTML = pug
    .compileFile(templatePath)({
      title: config.client.title,
      inviterUsername: inviterUsername,
      groupName: groupName,
      locationName: locationName,
      hashLink
    })
    .replace(/&amp;/g, '&') // Text message links can't have HTML escaped ampersands.

  const sms = {
    mobile,
    text: compiledHTML
  }
  return await sendSms(app, sms)
}

// This will attach the owner ID in the contact while creating/updating list item
export const sendInvite = async (app: Application, result: InviteDataType, params: UserParams) => {
  try {
    let token = ''
    if (result.identityProviderType === 'email' || (result.identityProviderType === 'sms' && result.token)) {
      token = result.token as string
    } else {
      token = result.inviteeId as string
    }
    const inviteType = result.inviteType
    const targetObjectId = result.targetObjectId

    const authUser = params.user as UserInterface

    if (result.identityProviderType === 'email') {
      await generateEmail(app, result, token, inviteType, authUser.name, targetObjectId)
    } else if (result.identityProviderType === 'sms') {
      await generateSMS(app, result, token, inviteType, authUser.name, targetObjectId)
    } else if (result.inviteeId != null) {
      if (inviteType === 'friend') {
        const existingRelationshipStatus = (await app.service('user-relationship').find({
          query: {
            $or: [
              {
                userRelationshipType: 'friend'
              },
              {
                userRelationshipType: 'requested'
              }
            ],
            userId: result.userId,
            relatedUserId: result.inviteeId
          }
        })) as Paginated<UserRelationshipDataType>
        if (existingRelationshipStatus.total === 0) {
          await app.service('user-relationship').create(
            {
              userRelationshipType: 'requested',
              userId: result.userId,
              relatedUserId: result.inviteeId
            },
            {}
          )
        }
      }

      const emailIdentityProviderResult = (await app.service('identity-provider').find({
        query: {
          userId: result.inviteeId,
          type: 'email'
        }
      })) as Page<IdentityProviderInterface>

      if (emailIdentityProviderResult.total > 0) {
        await generateEmail(
          app,
          result,
          emailIdentityProviderResult.data[0].token,
          inviteType,
          authUser.name,
          targetObjectId
        )
      } else {
        const SMSIdentityProviderResult = (await app.service('identity-provider').find({
          query: {
            userId: result.inviteeId,
            type: 'sms'
          }
        })) as Page<IdentityProviderInterface>

        if (SMSIdentityProviderResult.total > 0) {
          await generateSMS(
            app,
            result,
            SMSIdentityProviderResult.data[0].token,
            inviteType,
            authUser.name,
            targetObjectId
          )
        }
      }
    }
  } catch (err) {
    logger.error(err)
    return null!
  }
}
