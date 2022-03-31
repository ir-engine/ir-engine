import { Params } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import config from '../../appconfig'

/**
 * A method which get link
 *
 * @param type
 * @param hash hashed link
 * @returns login url
 * @author Vyacheslav Solovjov
 */
export function getLink(type: string, hash: string, subscriptionId?: string): string {
  return subscriptionId != null && subscriptionId.length > 0
    ? `${config.client.url}/auth/magiclink/${hash}?subId=${subscriptionId}`
    : `${config.client.url}/auth/magiclink/?token=${hash}&type=${type}`
}

/**
 * A method which get an invite link
 *
 * @param type
 * @param id of accept invite
 * @param passcode
 * @returns invite link
 * @author Vyacheslav Solovjov
 */
export function getInviteLink(type: string, id: string, passcode: string): string {
  return `${config.server.url}/a-i/${id}?t=${passcode}`
}

/**
 * A method which send an email
 *
 * @param app
 * @param email which is going to recieve message
 * Text message links can't have HTML escaped ampersands.
 * @author Vyacheslav Solovjov
 */
export async function sendEmail(app: Application, email: any): Promise<void> {
  if (email.to) {
    email.html = email.html.replace(/&amp;/g, '&')

    console.log('sendEmail() to:', email)

    try {
      await app.service('email').create(email)
    } catch (error) {
      console.error('Error sending email', error)
    }

    console.log('Email sent.')
  }
}
/**
 * A function which send sms
 *
 * @param app
 * @param sms text which is going to be sent
 * @author Vyacheslav Solovjov
 */
export const sendSms = async (app: Application, sms: any): Promise<void> => {
  console.log('sendSMS() to:', sms)
  await app
    .service('sms')
    .create(sms, null!)
    .then(() => console.log('Sent SMS'))
    .catch((err: any) => console.log('Error sending SMS', err))
}
