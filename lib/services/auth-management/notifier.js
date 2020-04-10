"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const path = __importStar(require("path"));
const pug = __importStar(require("pug"));
exports.default = (app) => {
    return {
        notifier: async (type, user) => {
            var _a;
            const appPath = path.dirname(require.main ? require.main.filename : '');
            const emailAccountTemplatesPath = path.join(appPath, '..', 'src', 'email-templates', 'account');
            let hashLink;
            let email;
            let templatePath;
            let compiledHTML;
            const mailFrom = (_a = process.env.MAIL_FROM) !== null && _a !== void 0 ? _a : 'noreply@myxr.email';
            switch (type) {
                case 'resendVerifySignup': // sending the user the verification email
                    hashLink = utils_1.getLink('verify', user.verifyToken);
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
                    return await utils_1.sendEmail(app, email);
                case 'verifySignup': // confirming verification
                    hashLink = utils_1.getLink('verify', user.verifyToken);
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
                    return await utils_1.sendEmail(app, email);
                case 'sendResetPwd':
                    hashLink = utils_1.getLink('reset', user.resetToken);
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
                    return await utils_1.sendEmail(app, email);
                case 'resetPwd':
                    hashLink = utils_1.getLink('reset', user.resetToken);
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
                    return await utils_1.sendEmail(app, email);
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
                    return await utils_1.sendEmail(app, email);
                case 'identityChange':
                    hashLink = utils_1.getLink('verifyChanges', user.verifyToken);
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
                    return await utils_1.sendEmail(app, email);
                default:
                    break;
            }
        }
    };
};
