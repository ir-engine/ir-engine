"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_oauth_1 = require("@feathersjs/authentication-oauth");
class GithubStrategy extends authentication_oauth_1.OAuthStrategy {
    async getEntityData(profile) {
        const baseData = await super.getEntityData(profile, null, {});
        return {
            ...baseData
        };
    }
}
exports.default = GithubStrategy;
