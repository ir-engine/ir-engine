import { Application } from '../../declarations'

export function getLink (type: string, hash: string): string {
  return (process.env.APP_HOST ?? '') + 'magicLink' + `?type=${type}&token=${hash}`
}

export async function sendEmail (app: Application, email: any): Promise<void> {
  if (email.to) {
    console.log(email)

    app.service('email').create(email).then(() =>
      console.log('Sent email')
    ).catch((err: any) =>
      console.log('Error sending email', err)
    )
  }
}

export async function sendSms (app: Application, sms: any): Promise<void> {
  app.service('sms').create(sms).then(() =>
    console.log('Sent SMS')
  ).catch((err: any) =>
    console.log('Error sending SMS', err)
  )
}
