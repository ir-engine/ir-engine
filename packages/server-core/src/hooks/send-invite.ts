import { HookContext, Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { Invite as InviteType } from '@xrengine/common/src/interfaces/Invite'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Application } from '../../declarations'
import config from '../appconfig'
import logger from '../logger'
import Page from '../types/PageObject'
import { getInviteLink, sendEmail, sendSms } from '../user/auth-management/auth-management.utils'
import { UserRelationshipDataType } from '../user/user-relationship/user-relationship.class'
import { UserDataType } from '../user/user/user.class'

export type InviteDataType = InviteType & { targetObjectId: UserId; passcode: string }

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'invite')

async function generateEmail(
  app: Application,
  result: InviteDataType,
  toEmail: string,
  inviteType: string,
  inviterUsername: string,
  targetObjectId?: string
): Promise<void> {
  let groupName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode)

  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-email-invite-${inviteType}.pug`)

  if (inviteType === 'group') {
    const group = await app.service('group').get(targetObjectId!)
    groupName = group.name
  }

  const compiledHTML = pug.compileFile(templatePath)({
    logo: config.client.logo,
    title: config.client.title,
    groupName: groupName,
    inviterUsername: inviterUsername,
    hashLink
  })
  const mailSender = config.email.from
  const email = {
    from: mailSender,
    to: toEmail,
    subject: config.email.subject[inviteType],
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
  let groupName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode)
  if (inviteType === 'group') {
    const group = await app.service('group').get(targetObjectId!)
    groupName = group.name
  }
  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-sms-invite-${inviteType}.pug`)
  const compiledHTML = pug
    .compileFile(templatePath)({
      title: config.client.title,
      inviterUsername: inviterUsername,
      groupName: groupName,
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
export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    try {
      // Getting logged in user and attaching owner of user
      const { app, result, params } = context

      let token = ''
      if (result.identityProviderType === 'email' || result.identityProviderType === 'sms') {
        token = result.token
      } else {
        token = result.inviteeId
      }
      const inviteType = result.inviteType
      const targetObjectId = result.targetObjectId

      const authUser = params.user as UserDataType

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

      return context
    } catch (err) {
      logger.error(err)
      return null!
    }
  }
}
