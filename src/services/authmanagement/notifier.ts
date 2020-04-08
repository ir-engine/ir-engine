// Initializes the `authmanagement` service on path `/authmanagement`
import { Application } from '../../declarations';

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
      let tokenLink;
      let email;
      switch (type) {
        case 'resendVerifySignup': //sending the user the verification email
          tokenLink = getLink('verify', user.verifyToken)
          email = {
             from: process.env.FROM_EMAIL,
             to: user.email,
             subject: 'Verify Signup',
             html: tokenLink
          }
          return sendEmail(email);

        case 'verifySignup': // confirming verification
          tokenLink = getLink('verify', user.verifyToken)
          email = {
             from: process.env.FROM_EMAIL,
             to: user.email,
             subject: 'Confirm Signup',
             html: 'Thanks for verifying your email'
          }
          return sendEmail(email);

        case 'sendResetPwd':
          tokenLink = getLink('reset', user.resetToken)
          email = {}
          return sendEmail(email);

        case 'resetPwd':
          tokenLink = getLink('reset', user.resetToken)
          email = {}
          return sendEmail(email);

        case 'passwordChange':
          email = {}
          return sendEmail(email);

        case 'identityChange':
          tokenLink = getLink('verifyChanges', user.verifyToken)
          email = {}
          return sendEmail(email);

        default:
          break
      }
    }
  }
}
