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

import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getLink, sendEmail } from './auth-management.utils'

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'account')

/**
 * A function which sent an email for authentication
 *
 * @param app
 * @returns {@function} sentEmail with app and email
 */
export default (app: Application) => {
  return {
    service: config.authentication.service,
    identifyUserProps: ['token', 'type'],
    sanitizeUserForClient: async (identityProvider: any): Promise<any> => {
      const authService = app.service('authentication')
      const accessToken = await (authService as any).createAccessToken({}, { subject: identityProvider.id.toString() })

      return {
        accessToken
      }
    },
    notifier: async (type: string, identityProvider: any): Promise<void> => {
      if (identityProvider.type !== 'password') {
        return
      }

      let hashLink
      let email
      let templatePath
      let compiledHTML
      const mailSender = config.email.from

      switch (type) {
        case 'resendVerifySignup': // sending the identityProvider the verification email
          hashLink = getLink('verify', identityProvider.verifyToken)
          templatePath = path.join(emailAccountTemplatesPath, 'verify-email.pug')
          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: identityProvider.token,
            hashLink
          })

          email = {
            from: mailSender,
            to: identityProvider.token,
            subject: 'Confirm Signup',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'verifySignup': // confirming verification
          hashLink = getLink('verify', identityProvider.verifyToken)
          templatePath = path.join(emailAccountTemplatesPath, 'email-verified.pug')
          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: identityProvider.token,
            hashLink
          })

          email = {
            from: mailSender,
            to: identityProvider.token,
            subject: 'Thank you, your email has been verified',
            html: compiledHTML
          }
          return await sendEmail(app, email)

        case 'sendResetPwd':
          hashLink = getLink('reset', identityProvider.resetToken)
          templatePath = path.join(emailAccountTemplatesPath, 'reset-password.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: identityProvider.token,
            hashLink
          })

          email = {
            from: mailSender,
            to: identityProvider.token,
            subject: 'Reset Password',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'resetPwd':
          hashLink = getLink('reset', identityProvider.resetToken)
          templatePath = path.join(emailAccountTemplatesPath, 'password-was-reset.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: identityProvider.token,
            hashLink
          })

          email = {
            from: mailSender,
            to: identityProvider.token,
            subject: 'Your password was reset',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'passwordChange':
          templatePath = path.join(emailAccountTemplatesPath, 'password-change.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: identityProvider.token
          })

          email = {
            from: mailSender,
            to: identityProvider.email,
            subject: 'Your password was changed',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'identityChange':
          hashLink = getLink('verifyChanges', identityProvider.verifyToken)

          templatePath = path.join(emailAccountTemplatesPath, 'identity-change.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: identityProvider.token,
            hashLink,
            changes: identityProvider.verifyChanges
          })

          email = {
            from: mailSender,
            to: identityProvider.token,
            subject: 'Your account was changed. Please verify the changes',
            html: compiledHTML
          }
          return await sendEmail(app, email)

        default:
          break
      }
    }
  }
}
