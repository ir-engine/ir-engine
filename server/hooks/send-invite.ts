import {HookContext, Params} from '@feathersjs/feathers'
import {
  extractLoggedInUserFromParams,
  getInviteLink,
  sendEmail,
  sendSms
} from '../services/auth-management/auth-management.utils'
import * as path from 'path'
import {BadRequest} from "@feathersjs/errors";
import * as pug from "pug";
import config from "../config";

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext) => {
    // Getting logged in user and attaching owner of user
    const { app, result, params } = context

    const authService = app.service('authentication')
    const identityProviderService = this.app.service(
        'identity-provider'
    )

// check magiclink type
    let token = ''
    let identityProvider
    if (result.identityProviderType === 'email' || result.identityProviderType === 'sms') {
      token = result.token
    }
    else {
      token = result.inviteeId
    }
    const inviteType = result.inviteType

    const authUser = extractLoggedInUserFromParams(params)

    if (result.identityProviderType === 'email') {
      await generateEmail(
          token,
          inviteType,
          result.passcode,
          authUser.name
      )
    } else if (result.identityProviderType === 'sms') {
      await generateSMS(
          token,
          inviteType,
          result.passcode,
          authUser.name
      )
    }
    return context
  }
}

async function generateEmail (
    toEmail: string,
    inviteType: string,
    passcode: string,
    inviterUsername: string
): Promise<void> {
  const hashLink = getInviteLink(inviteType, passcode)
  const appPath = path.dirname(require.main ? require.main.filename : '')
  const emailAccountTemplatesPath = path.join(
      appPath,
      '..',
      'server',
      'email-templates',
      'invite'
  )

  const templatePath = path.join(
      emailAccountTemplatesPath,
      `'magiclink-email-invite-${inviteType}.pug`
  )

  const compiledHTML = pug.compileFile(templatePath)({
    logo: config.client.logo,
    title: config.client.title,
    inviterUsername: inviterUsername,
    hashLink
  })
  const mailSender = config.email.from
  const email = {
    from: mailSender,
    to: toEmail,
    subject: config.email.subject.login,
    html: compiledHTML
  }

  return await sendEmail(this.app, email)
}

async function generateSMS (
    mobile: string,
    inviteType: string,
    passcode: string,
    inviterUsername
): Promise<void> {
  const hashLink = getInviteLink(inviteType, passcode)
  const appPath = path.dirname(require.main ? require.main.filename : '')
  const emailAccountTemplatesPath = path.join(
      appPath,
      '..',
      'server',
      'email-templates',
      'account'
  )
  const templatePath = path.join(
      emailAccountTemplatesPath,
      `'magiclink-sms-invite-${inviteType}.pug`
  )
  const compiledHTML = pug.compileFile(templatePath)({
    title: config.client.title,
    inviterUsername: inviterUsername,
    hashLink
  }).replace(/&amp;/g, '&') // Text message links can't have HTML escaped ampersands.

  const sms = {
    mobile,
    text: compiledHTML
  }
  return await sendSms(this.app, sms)
}
