"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_oauth_1 = require("@feathersjs/authentication-oauth");
class GithubStrategy extends authentication_oauth_1.OAuthStrategy {
    async getEntityData(profile) {
        const baseData = await super.getEntityData(profile, null, {});
        return {
            ...baseData,
            email: profile.email
        };
    }
    async getRedirect(data, params) {
        var _a;
        const redirectHost = (_a = process.env.GITHUB_CALLBACK_URL) !== null && _a !== void 0 ? _a : '';
        if (Object.getPrototypeOf(data) === Error.prototype) {
            const err = data.message;
            return redirectHost + `?error=${err}`;
        }
        else {
            const token = data.accessToken;
            return redirectHost + `?token=${token}`;
        }
    }
}
exports.default = GithubStrategy;
