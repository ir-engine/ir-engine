/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { instancePath } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { ChannelID, channelPath } from '@ir-engine/common/src/schemas/social/channel.schema'
import { InviteType } from '@ir-engine/common/src/schemas/social/invite.schema'
import { locationPath } from '@ir-engine/common/src/schemas/social/location.schema'
import { acceptInvitePath } from '@ir-engine/common/src/schemas/user/accept-invite.schema'
import { EmailData, emailPath } from '@ir-engine/common/src/schemas/user/email.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { SmsData, smsPath } from '@ir-engine/common/src/schemas/user/sms.schema'
import { userRelationshipPath } from '@ir-engine/common/src/schemas/user/user-relationship.schema'
import { UserID, UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application, HookContext } from '../../declarations'
import config from '../appconfig'
import logger from '../ServerLogger'

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'invite')

/**
 * A method which get an invite link
 *
 * @param type
 * @param id of accept invite
 * @param passcode
 * @returns invite link
 */
export function getInviteLink(type: string, id: string, passcode: string): string {
  return `${config.server.url}/${acceptInvitePath}/${id}?t=${passcode}`
}

async function generateEmail({
  app,
  result,
  toEmail,
  inviteType,
  inviterUsername,
  targetObjectId
}: {
  app: Application
  result: InviteType
  toEmail: string
  inviteType: string
  inviterUsername: string
  targetObjectId?: string
}): Promise<void> {
  if (config.testEnabled) {
    return
  }

  let channelName, locationName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode!)

  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-email-invite-${inviteType}.pug`)

  if (inviteType === 'channel') {
    const channel = await app.service(channelPath).get(targetObjectId! as ChannelID)
    channelName = channel.name
  }

  if (inviteType === 'location') {
    const location = await app.service(locationPath).get(targetObjectId!)
    locationName = location.name
  }

  if (inviteType === 'instance') {
    const instance = await app.service(instancePath).get(targetObjectId!)
    locationName = instance.location.name
  }

  const compiledHTML = pug.compileFile(templatePath)({
    logo: config.client.logo,
    title: config.client.title,
    channelName: channelName,
    locationName: locationName,
    inviterUsername: inviterUsername,
    hashLink
  })
  const mailSender = config.email.from
  const email: EmailData = {
    from: mailSender,
    to: toEmail,
    subject: config.client.title + ' ' + (config.email.subject[inviteType] || 'Invitation'),
    html: compiledHTML
  }

  email.html = email.html.replace(/&amp;/g, '&')
  await app.service(emailPath).create(email)
}

async function generateSMS({
  app,
  result,
  mobile,
  inviteType,
  inviterUsername,
  targetObjectId
}: {
  app: Application
  result: InviteType
  mobile: string
  inviteType: string
  inviterUsername: string
  targetObjectId?: string
}): Promise<void> {
  if (config.testEnabled) {
    return
  }

  let channelName, locationName
  const hashLink = getInviteLink(inviteType, result.id, result.passcode!)

  if (inviteType === 'channel') {
    const channel = await app.service(channelPath).get(targetObjectId! as ChannelID)
    channelName = channel.name
  }

  if (inviteType === 'location') {
    const location = await app.service(locationPath).get(targetObjectId!)
    locationName = location.name
  }

  if (inviteType === 'instance') {
    const instance = await app.service(instancePath).get(targetObjectId!)
    locationName = instance.location.name
  }
  const templatePath = path.join(emailAccountTemplatesPath, `magiclink-sms-invite-${inviteType}.pug`)
  const compiledHTML = pug
    .compileFile(templatePath)({
      title: config.client.title,
      inviterUsername: inviterUsername,
      channelName: channelName,
      locationName: locationName,
      hashLink
    })
    .replace(/&amp;/g, '&') // Text message links can't have HTML escaped ampersands.

  const sms: SmsData = {
    mobile,
    text: compiledHTML
  }

  await app
    .service(smsPath)
    .create(sms, null!)
    .then(() => logger.info('Sent SMS'))
    .catch((err: any) => logger.error(err, `Error sending SMS: ${err.message}`))
}

// This will attach the owner ID in the contact while creating/updating list item
export const sendInvite = async (context: HookContext) => {
  const { app, result, params } = context
  try {
    let token = ''
    if (result.identityProviderType === 'email' || (result.identityProviderType === 'sms' && result.token)) {
      token = result.token as string
    } else {
      token = result.inviteeId as string
    }
    const inviteType = result.inviteType
    const targetObjectId = result.targetObjectId

    const authUser = params.user as UserType

    if (result.identityProviderType === 'email') {
      await generateEmail({
        app,
        result,
        toEmail: token,
        inviteType,
        inviterUsername: authUser.name,
        targetObjectId
      })
    } else if (result.identityProviderType === 'sms') {
      await generateSMS({
        app,
        result,
        mobile: token,
        inviteType,
        inviterUsername: authUser.name,
        targetObjectId
      })
    } else if (result.inviteeId != null) {
      if (inviteType === 'friend') {
        const existingRelationshipStatus = await app.service(userRelationshipPath).find({
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
            relatedUserId: result.inviteeId as UserID
          }
        })
        if (existingRelationshipStatus.total === 0) {
          await app.service(userRelationshipPath).create(
            {
              userRelationshipType: 'requested',
              userId: result.userId,
              relatedUserId: result.inviteeId as UserID
            },
            {}
          )
        }
      }

      const emailIdentityProviderResult = (await app.service(identityProviderPath).find({
        query: {
          userId: result.inviteeId as UserID,
          type: 'email'
        }
      })) as Paginated<IdentityProviderType>

      if (emailIdentityProviderResult.total > 0) {
        await generateEmail({
          app,
          result,
          toEmail: emailIdentityProviderResult.data[0].token,
          inviteType,
          inviterUsername: authUser.name,
          targetObjectId
        })
      } else {
        const SMSIdentityProviderResult = (await app.service(identityProviderPath).find({
          query: {
            userId: result.inviteeId as UserID,
            type: 'sms'
          }
        })) as Paginated<IdentityProviderType>

        if (SMSIdentityProviderResult.total > 0) {
          await generateSMS({
            app,
            result,
            mobile: SMSIdentityProviderResult.data[0].token,
            inviteType,
            inviterUsername: authUser.name,
            targetObjectId
          })
        }
      }
    }
  } catch (err) {
    logger.error(err)
    return null!
  }
}
