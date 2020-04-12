
import { Application } from '../../declarations'

export const getLink = (type: string, hash: string): string =>
  (process.env.APP_HOST ?? '') + 'magicLink' + `?type=${type}&token=${hash}`

export const sendEmail = async (app: Application, email: any): Promise<void> =>
  await app.service('email').create(email).then(() =>
    console.log('Sent email')
  ).catch((err: any) =>
    console.log('Error sending email', err)
  )
