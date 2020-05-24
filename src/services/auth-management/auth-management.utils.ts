import { Params } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import config from 'config'

export function getLink (type: string, hash: string): string {
  return (process.env.APP_HOST ?? '') + 'magicLink' + `?type=${type}&token=${hash}`
}

export async function sendEmail (app: Application, email: any): Promise<void> {
  if (email.to) {
    console.log('sendEmail() to:', email)

    try {
      await app.service('email').create(email)
    } catch (error) {
      console.error('Error sending email', error)
    }

    console.log('Email sent.')
  }
}

export const sendSms = async (app: Application, sms: any): Promise<void> =>
  await app.service('sms').create(sms).then(() =>
    console.log('Sent SMS')
  ).catch((err: any) =>
    console.log('Error sending SMS', err)
  )

/**
 * This method will extract the loggedIn User from params
 * @param params
 */
export const extractLoggedInUserFromParams = (params: Params): any => {
  return params[config.get('authentication.entity')]
}
