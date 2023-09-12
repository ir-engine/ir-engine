/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { acceptInvitePath } from '@etherealengine/engine/src/schemas/user/accept-invite.schema'
import { SmsData, smsPath } from '@etherealengine/engine/src/schemas/user/sms.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import config from '../../appconfig'

/**
 * A method which get link
 *
 * @param type
 * @param hash hashed link
 * @returns login url
 */
export function getLink(type: string, hash: string, subscriptionId?: string): string {
  return subscriptionId != null && subscriptionId.length > 0
    ? `${config.server.url}/login/${hash}?subId=${subscriptionId}`
    : `${config.server.url}/login/${hash}`
}

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

/**
 * A method which send an email
 *
 * @param app
 * @param email which is going to recieve message
 * Text message links can't have HTML escaped ampersands.
 */
export async function sendEmail(app: Application, email: any): Promise<void> {
  if (email.to) {
    email.html = email.html.replace(/&amp;/g, '&')
    logger.info('sendEmail() to: ' + email)

    try {
      await app.service('email').create(email)
    } catch (err) {
      logger.error(err, `Error sending email: ${err.message}`)
    }

    logger.info('Email sent.')
  }
}
/**
 * A function which send sms
 *
 * @param app
 * @param sms text which is going to be sent
 */
export const sendSms = async (app: Application, sms: SmsData) => {
  logger.info(`sendSMS() to "${sms}."`)
  await app
    .service(smsPath)
    .create(sms, null!)
    .then(() => logger.info('Sent SMS'))
    .catch((err: any) => logger.error(err, `Error sending SMS: ${err.message}`))
}
