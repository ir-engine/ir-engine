import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'

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
  return `${config.server.url}/a-i/${id}?t=${passcode}`
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
export const sendSms = async (app: Application, sms: any): Promise<void> => {
  logger.info(`sendSMS() to "${sms}."`)
  await app
    .service('sms')
    .create(sms, null!)
    .then(() => logger.info('Sent SMS'))
    .catch((err: any) => logger.error(err, `Error sending SMS: ${err.message}`))
}
