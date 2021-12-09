import { Application } from '../../../declarations'
import { getLink, sendEmail } from './auth-management.utils'
import * as path from 'path'
import * as pug from 'pug'
import requireMainFilename from 'require-main-filename'
import config from '../../appconfig'

/**
 * A function which sent an email for authentication
 *
 * @param app
 * @returns {@function} sentEmail with app and email
 * @author Vyacheslav Solovjov
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

      const [dbEmailConfig] = await app.service('email-setting').find()
      const emailConfig = dbEmailConfig || config.email

      const appPath = path.dirname(requireMainFilename())
      const emailAccountTemplatesPath = path.join(appPath, '..', '..', 'server-core', 'email-templates', 'account')
      let hashLink
      let email
      let templatePath
      let compiledHTML
      const mailSender = emailConfig.from

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
