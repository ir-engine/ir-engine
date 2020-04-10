"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("@feathersjs/authentication");
const authentication_local_1 = require("@feathersjs/authentication-local");
const authentication_oauth_1 = require("@feathersjs/authentication-oauth");
const github_1 = __importDefault(require("./strategies/github"));
const google_1 = __importDefault(require("./strategies/google"));
const facebook_1 = __importDefault(require("./strategies/facebook"));
exports.default = (app) => {
    const authentication = new authentication_1.AuthenticationService(app);
    authentication.register('jwt', new authentication_1.JWTStrategy());
    authentication.register('local', new authentication_local_1.LocalStrategy());
    authentication.register('google', new google_1.default());
    authentication.register('facebook', new facebook_1.default());
    authentication.register('github', new github_1.default());
    app.use('/authentication', authentication);
    app.configure(authentication_oauth_1.expressOauth());
};
