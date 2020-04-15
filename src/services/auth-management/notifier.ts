// Initializes the `authmanagement` service on path `/authmanagement`
import { Application } from '../../declarations'
import { getLink, sendEmail } from './utils'
import * as path from 'path'
import * as pug from 'pug'
import config from 'config'

export default (app: Application): any => {
  return {
    service: config.get('authentication.service'),
    notifier: async (type: string, user: any): Promise<void> => {
      const appPath = path.dirname(require.main ? require.main.filename : '')
      const emailAccountTemplatesPath =
        path.join(appPath, '..', 'src', 'email-templates', 'account')
      let hashLink
      let email
      let templatePath
      let compiledHTML
      const mailFrom = process.env.MAIL_FROM ?? 'noreply@myxr.email'

      switch (type) {
        case 'resendVerifySignup': // sending the user the verification email
          hashLink = getLink('verify', user.verifyToken)
          templatePath = path.join(emailAccountTemplatesPath, 'verify-email.pug')
          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom
          })

          email = {
            from: mailFrom,
            to: user.email,
            subject: 'Confirm Signup',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'verifySignup': // confirming verification
          hashLink = getLink('verify', user.verifyToken)
          templatePath = path.join(emailAccountTemplatesPath, 'email-verified.pug')
          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom
          })

          email = {
            from: mailFrom,
            to: user.email,
            subject: 'Thank you, your email has been verified',
            html: compiledHTML
          }
          return await sendEmail(app, email)

        case 'sendResetPwd':
          console.log('---------', user)

          hashLink = getLink('reset', user.resetToken)
          templatePath = path.join(emailAccountTemplatesPath, 'reset-password.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom
          })

          email = {
            from: mailFrom,
            to: user.email,
            subject: 'Reset Password',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'resetPwd':
          hashLink = getLink('reset', user.resetToken)
          templatePath = path.join(emailAccountTemplatesPath, 'password-was-reset.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom
          })

          email = {
            from: mailFrom,
            to: user.email,
            subject: 'Your password was reset',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'passwordChange':
          templatePath = path.join(emailAccountTemplatesPath, 'password-change.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            mailFrom
          })

          email = {
            from: mailFrom,
            to: user.email,
            subject: 'Your password was changed',
            html: compiledHTML
          }

          return await sendEmail(app, email)

        case 'identityChange':
          hashLink = getLink('verifyChanges', user.verifyToken)

          templatePath = path.join(emailAccountTemplatesPath, 'identity-change.pug')

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom,
            changes: user.verifyChanges
          })

          email = {
            from: mailFrom,
            to: user.email,
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
