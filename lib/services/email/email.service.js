"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const email_hooks_1 = __importDefault(require("./email.hooks"));
const nodemailer_smtp_transport_1 = __importDefault(require("nodemailer-smtp-transport"));
const feathers_mailer_1 = __importDefault(require("feathers-mailer"));
exports.default = (app) => {
    app.use('/email', feathers_mailer_1.default(nodemailer_smtp_transport_1.default({
        host: process.env.SMTP_HOST,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })));
    const service = app.service('email');
    service.hooks(email_hooks_1.default);
};
