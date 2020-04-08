"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const pug = require('pug');
function default_1(app) {
    function getLink(type, hash) {
        const url = process.env.APP_HOST + type + '?token=' + hash;
        return url;
    }
    function sendEmail(email) {
        return app.service('email').create(email).then(function (result) {
            console.log('Sent email', result);
        }).catch(err => {
            console.log('Error sending email', err);
        });
    }
    return {
        notifier: function (type, user) {
            let appPath = path.dirname(require.main ? require.main.filename : '');
            let emailAccountTemplatesPath = path.join(appPath, '..', 'src', 'email-templates', 'account');
            let hashLink;
            let email;
            let templatePath;
            let compiledHTML;
            let mailFrom = process.env.MAIL_FROM || 'support@xrchat.com';
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
                    hashLink = getLink('reset', user.resetToken);
                    templatePath = path.join(emailAccountTemplatesPath, 'reset-password.pug');
                    compiledHTML = pug.compileFile(templatePath)({
                        logo: '',
                        name: user.name || user.email,
                        hashLink,
                        mailFrom
                    });
                    email = {
                        from: mailFrom,
                        to: user.email,
                        subject: 'Reset Password',
                        html: compiledHTML
                    };
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
                    });
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
                    });
                    email = {
                        from: mailFrom,
                        to: user.email,
                        subject: 'Your account was changed. Please verify the changes',
                        html: compiledHTML
                    };
                    return sendEmail(email);
                default:
                    break;
            }
        }
    };
}
exports.default = default_1;
