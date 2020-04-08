"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const email_hooks_1 = __importDefault(require("./email.hooks"));
const nodemailer_smtp_transport_1 = __importDefault(require("nodemailer-smtp-transport"));
const Mailer = require('feathers-mailer');
function default_1(app) {
    // Initialize our service with any options it requires
    app.use('/email', Mailer(nodemailer_smtp_transport_1.default({
        host: 'email-smtp.us-west-2.amazonaws.com',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })));
    // Get our initialized service so that we can register hooks
    const service = app.service('email');
    service.hooks(email_hooks_1.default);
}
exports.default = default_1;
