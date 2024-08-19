/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

export type * from './analytics/analytics.schema'
export type * from './assets/asset-library.schema'
export type * from './assets/model-transform.schema'
export type * from './bot/bot-command.schema'
export type * from './bot/bot.schema'
export type * from './cluster/api-job.schema'
export type * from './cluster/build-status.schema'
export type * from './cluster/logs-api.schema'
export type * from './cluster/migrations-info.schema'
export type * from './cluster/pods.schema'
export type * from './integrations/metabase/metabase-setting.schema'
export type * from './integrations/metabase/metabase-url.schema'
export type * from './integrations/zendesk/zendesk.schema'
export type * from './matchmaking/match-instance.schema'
export type * from './matchmaking/match-user.schema'
export type * from './media/archiver.schema'
export type * from './media/file-browser-upload.schema'
export type * from './media/file-browser.schema'
export type * from './media/invalidation.schema'
export type * from './media/oembed.schema'
export type * from './media/static-resource.schema'
export type * from './networking/instance-active.schema'
export type * from './networking/instance-attendance.schema'
export type * from './networking/instance-authorized-user.schema'
export type * from './networking/instance-friends.schema'
export type * from './networking/instance-provision.schema'
export type * from './networking/instance.schema'
export type * from './projects/builder-info.schema'
export type * from './projects/project-branches.schema'
export type * from './projects/project-build.schema'
export type * from './projects/project-builder-tags.schema'
export type * from './projects/project-check-source-destination-match.schema'
export type * from './projects/project-check-unfetched-commit.schema'
export type * from './projects/project-commits.schema'
export type * from './projects/project-destination-check.schema'
export type * from './projects/project-github-push.schema'
export type * from './projects/project-invalidate.schema'
export type * from './projects/project-permission-type.schema'
export type * from './projects/project-permission.schema'
export type * from './projects/project.schema'
export type * from './projects/projects.schema'
export type * from './recording/recording-resource-upload.schema'
export type * from './recording/recording-resource.schema'
export type * from './recording/recording.schema'
export type * from './route/route.schema'
export type * from './scope/scope-type.schema'
export type * from './scope/scope.schema'
export type * from './setting/authentication-setting.schema'
export type * from './setting/aws-setting.schema'
export type * from './setting/chargebee-setting.schema'
export type * from './setting/client-setting.schema'
export type * from './setting/coil-setting.schema'
export type * from './setting/email-setting.schema'
export type * from './setting/feature-flag-setting.schema'
export type * from './setting/helm-setting.schema'
export type * from './setting/instance-server-setting.schema'
export type * from './setting/project-setting.schema'
export type * from './setting/redis-setting.schema'
export type * from './setting/server-setting.schema'
export type * from './setting/task-server-setting.schema'
export type * from './setting/zendesk-setting.schema'
export type * from './social/channel-user.schema'
export type * from './social/channel.schema'
export type * from './social/invite-code-lookup.schema'
export type * from './social/invite-type.schema'
export type * from './social/invite.schema'
export type * from './social/location-admin.schema'
export type * from './social/location-authorized-user.schema'
export type * from './social/location-ban.schema'
export type * from './social/location-setting.schema'
export type * from './social/location-type.schema'
export type * from './social/location.schema'
export type * from './social/message.schema'
export type * from './user/accept-invite.schema'
export type * from './user/avatar.schema'
export type * from './user/discord-bot-auth.schema'
export type * from './user/email.schema'
export type * from './user/generate-token.schema'
export type * from './user/github-repo-access-refresh.schema'
export type * from './user/github-repo-access-webhook.schema'
export type * from './user/github-repo-access.schema'
export type * from './user/identity-provider.schema'
export type * from './user/login-token.schema'
export type * from './user/login.schema'
export type * from './user/magic-link.schema'
export type * from './user/sms.schema'
export type * from './user/user-api-key.schema'
export type * from './user/user-avatar.schema'
export type * from './user/user-kick.schema'
export type * from './user/user-login.schema'
export type * from './user/user-relationship-type.schema'
export type * from './user/user-relationship.schema'
export type * from './user/user-setting.schema'
export type * from './user/user.schema'
export type * from './world/spawn-point.schema'

export type * from './projects/project-history.schema'

export const locationPath = 'location'

export const userRelationshipPath = 'user-relationship'

export const githubRepoAccessPath = 'github-repo-access'

export const discordBotAuthPath = 'discord-bot-auth'

export const emailPath = 'email'

export const loginTokenPath = 'login-token'

export const githubRepoAccessWebhookPath = 'github-repo-access-webhook'

export const githubRepoAccessRefreshPath = 'github-repo-access-refresh'

export const userApiKeyPath = 'user-api-key'

export const userRelationshipTypePath = 'user-relationship-type'

export const generateTokenPath = 'generate-token'

export const identityProviderPath = 'identity-provider'

export const smsPath = 'sms'

export const avatarPath = 'avatar'

export const magicLinkPath = 'magic-link'

export const userKickPath = 'user-kick'

export const userLoginPath = 'user-login'

export const userSettingPath = 'user-setting'

export const userAvatarPath = 'user-avatar'

export const loginPath = 'login'

export const userPath = 'user'

export const acceptInvitePath = 'accept-invite'

export const messagePath = 'message'

export const locationAuthorizedUserPath = 'location-authorized-user'

export const channelUserPath = 'channel-user'

export const inviteCodeLookupPath = 'invite-code-lookup'

export const inviteTypePath = 'invite-type'

export const invitePath = 'invite'

export const locationTypePath = 'location-type'

export const locationAdminPath = 'location-admin'

export const channelPath = 'channel'

export const locationBanPath = 'location-ban'

export const locationSettingPath = 'location-setting'

export const assetLibraryPath = 'asset-library'

export const modelTransformPath = 'model-transform'

export const recordingResourcePath = 'recording-resource'

export const recordingPath = 'recording'

export const recordingResourceUploadPath = 'recording-resource-upload'

export const instanceAttendancePath = 'instance-attendance'

export const fileBrowserPath = 'file-browser'

export const fileBrowserUploadPath = 'file-browser-upload'

export const staticResourcePath = 'static-resource'

export const oembedPath = 'oembed'

export const instanceActivePath = 'instance-active'

export const archiverPath = 'archiver'

export const instanceProvisionPath = 'instance-provision'

export const instanceAuthorizedUserPath = 'instance-authorized-user'

export const instancePath = 'instance'

export const instanceFriendsPath = 'instance-friends'

export const routePath = 'route'

export const helmMainVersionPath = 'helm-main-version'
export const helmBuilderVersionPath = 'helm-builder-version'

export const projectSettingPath = 'project-setting'

export const coilSettingPath = 'coil-setting'

export const awsSettingPath = 'aws-setting'

export const taskServerSettingPath = 'task-server-setting'

export const emailSettingPath = 'email-setting'

export const featureFlagSettingPath = 'feature-flag-setting'

export const instanceServerSettingPath = 'instance-server-setting'

export const clientSettingPath = 'client-setting'

export const redisSettingPath = 'redis-setting'

export const chargebeeSettingPath = 'chargebee-setting'

export const matchUserPath = 'match-user'

export const matchInstancePath = 'match-instance'

export const authenticationSettingPath = 'authentication-setting'

export const analyticsPath = 'analytics'

export const serverSettingPath = 'server-setting'

export const zendeskSettingPath = 'zendesk-setting'

export const scopeTypePath = 'scope-type'

export const scopePath = 'scope'

export const projectPermissionPath = 'project-permission'

export const projectBranchesPath = 'project-branches'

export const projectBuildPath = 'project-build'

export const projectInvalidatePath = 'project-invalidate'

export const projectPath = 'project'

export const projectsPath = 'projects'

export const builderInfoPath = 'builder-info'

export const projectCheckSourceDestinationMatchPath = 'project-check-source-destination-match'

export const botPath = 'bot'

export const botCommandPath = 'bot-command'

export const projectPermissionTypePath = 'project-permission-type'

export const projectDestinationCheckPath = 'project-destination-check'

export const spawnPointPath = 'spawn-point'

export const projectCheckUnfetchedCommitPath = 'project-check-unfetched-commit'

export const projectBuilderTagsPath = 'project-builder-tags'

export const logsApiPath = 'logs-api'

export const projectGithubPushPath = 'project-github-push'

export const projectCommitsPath = 'project-commits'

export const podsPath = 'pods'

export const buildStatusPath = 'build-status'
export const helmSettingPath = 'helm-setting'
export const apiJobPath = 'api-job'

export const migrationsInfoPath = 'knex_migrations'

export const uploadAssetPath = 'upload-asset'

export const invalidationPath = 'invalidation'

export const imageConvertPath = 'image-convert'

export const zendeskPath = 'zendesk'

export const projectHistoryPath = 'project-history'

export const metabaseSettingPath = 'metabase-setting'

export const metabaseUrlPath = 'metabase-url'
