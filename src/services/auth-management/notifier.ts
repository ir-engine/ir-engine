// Initializes the `authmanagement` service on path `/authmanagement`
import { Application } from '../../declarations';
import path from 'path';

const pug = require('pug')

export default function (app: Application) {
  function getLink(type: string, hash: string) {
    const url = process.env.APP_HOST + type + '?token=' + hash
    return url
  }

  function sendEmail(email: any) {
    return app.service('email').create(email).then(function (result) {
      console.log('Sent email', result)
    }).catch(err => {
      console.log('Error sending email', err)
    })
  }

  return {
    notifier: function(type: string, user: any) {
      let hashLink;
      let email;
      let emailAccountTemplatesPath = 
        path.join(app.get('src'), 'email-templates', 'account');
      let templatePath;
      let compiledHTML;
      let mailFrom = process.env.MAIL_FROM || 'support@xrchat.com'

      switch (type) {
        case 'resendVerifySignup': //sending the user the verification email
          hashLink = getLink('verify', user.verifyToken);
          templatePath = path.join(emailAccountTemplatesPath, 'verify-email.pug');
          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom
          });

          email = {
             from: mailFrom,
             to: user.email,
             subject: 'Confirm Signup',
             html: compiledHTML
          };

          return sendEmail(email);

        case 'verifySignup': // confirming verification
          hashLink = getLink('verify', user.verifyToken);
          templatePath = path.join(emailAccountTemplatesPath, 'email-verified.pug');
          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom
          });

          email = {
             from: mailFrom,
             to: user.email,
             subject: 'Thank you, your email has been verified',
             html: compiledHTML
          };
          return sendEmail(email);

        case 'sendResetPwd':
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

          return sendEmail(email);

        case 'resetPwd':
          hashLink = getLink('reset', user.resetToken);
          templatePath = path.join(emailAccountTemplatesPath, 'password-was-reset.pug');

          compiledHTML = pug.compileFile(templatePath)({
            logo: '',
            name: user.name || user.email,
            hashLink,
            mailFrom
          });

          email = {
             from: mailFrom,
             to: user.email,
             subject: 'Your password was reset',
             html: compiledHTML
          };

          return sendEmail(email);

        case 'passwordChange':
          templatePath = path.join(emailAccountTemplatesPath, 'password-change.pug');

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
          };

          return sendEmail(email);

        case 'identityChange':
          hashLink = getLink('verifyChanges', user.verifyToken);

          templatePath = path.join(emailAccountTemplatesPath, 'identity-change.pug');

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
          };
          return sendEmail(email);

        default:
          break
      }
    }
  }
}
