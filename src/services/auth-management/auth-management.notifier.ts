import { Application } from '../../declarations'
import { getLink, sendEmail } from './auth-management.utils'
import * as path from 'path'
import * as pug from 'pug'
import config from 'config'

export default (app: Application): any => {
  return {
    service: config.get('authentication.service'),
    identifyUserProps: ['token', 'identityProviderType'],
    sanitizeUserForClient: async (identityProvider: any): Promise<any> => {
      const authService = app.service('authentication')
      const accessToken = await authService.createAccessToken({}, { subject: identityProvider.id.toString() })

      return {
        accessToken
      }
    },
    notifier: async (type: string, identityProvider: any): Promise<void> => {
      if (identityProvider.identityProviderType !== 'password') {
        return
      }

      const appPath = path.dirname(require.main ? require.main.filename : '')
      const emailAccountTemplatesPath =
        path.join(appPath, '..', 'src', 'email-templates', 'account')
      let hashLink
      let email
      let templatePath
      let compiledHTML
      const mailFrom = process.env.SMTP_FROM_EMAIL ?? 'noreply@myxr.email'
      const mailSender = `${(process.env.SMTP_FROM_NAME ?? '')}<${mailFrom}>`

      switch (type) {
        case 'resendVerifySignup': // sending the identityProvider the verification email
          hashLink = getLink('verify', identityProvider.verifyToken)
          templatePath = path.join(emailAccountTemplatesPath, 'verify-email.pug')
          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: identityProvider.token,
            hashLink,
            mailFrom
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
            hashLink,
            mailFrom
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
            hashLink,
            mailFrom
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
            hashLink,
            mailFrom
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
            name: identityProvider.token,
            mailFrom
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
            mailFrom,
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
