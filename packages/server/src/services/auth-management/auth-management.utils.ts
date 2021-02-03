import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import config from '../../config';

export function getLink (type: string, hash: string): string {
  return `${config.server.url}/login/${hash}`;
}

export function getInviteLink (type: string, id: string, passcode: string): string {
  return `${config.server.url}/a-i/${id}?t=${passcode}`;
}

export async function sendEmail (app: Application, email: any): Promise<void> {
  if (email.to) {
    email.html = email.html.replace(/&amp;/g, '&'); // Text message links can't have HTML escaped ampersands.

    console.log('sendEmail() to:', email);

    try {
      await app.service('email').create(email);
    } catch (error) {
      console.error('Error sending email', error);
    }

    console.log('Email sent.');
  }
}

export const sendSms = async (app: Application, sms: any): Promise<void> => {
  await app.service('sms').create(sms).then(() =>
    console.log('Sent SMS')
  ).catch((err: any) =>
    console.log('Error sending SMS', err)
  );
};

/**
 * This method will extract the loggedIn User from params
 * @param params
 */
export const extractLoggedInUserFromParams = (params: Params): any => {
  return params[config.authentication.entity];
};
