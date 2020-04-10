
import { Application } from '../../declarations'

export function getLink (type: string, hash: string): string {
  const host = process.env.APP_HOST ?? ''
  const url = host + 'magicLink' + `?type=${type}&token=${hash}`
  return url
}

export async function sendEmail (app: Application, email: any): Promise<void> {
  return await app.service('email').create(email).then(() => {
    console.log('Sent email')
  }).catch(err => {
    console.log('Error sending email', err)
  })
}
