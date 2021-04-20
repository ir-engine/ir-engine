---
id: "appconfig"
title: "Module: appconfig"
sidebar_label: "appconfig"
custom_edit_url: null
hide_title: true
---

# Module: appconfig

## Variables

### db

• `Const` **db**: *any*

Database

Defined in: [packages/server-core/src/appconfig.ts:17](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/appconfig.ts#L17)

___

### default

• `Const` **default**: *object*

Full config

#### Type declaration:

Name | Type |
:------ | :------ |
`authentication` | *object* |
`authentication.authStrategies` | *string*[] |
`authentication.bearerToken` | *object* |
`authentication.bearerToken.numBytes` | *number* |
`authentication.callback` | *object* |
`authentication.callback.facebook` | *string* |
`authentication.callback.github` | *string* |
`authentication.callback.google` | *string* |
`authentication.callback.linkedin2` | *string* |
`authentication.callback.twitter` | *string* |
`authentication.entity` | *string* |
`authentication.jwtOptions` | *object* |
`authentication.jwtOptions.expiresIn` | *string* |
`authentication.local` | *object* |
`authentication.local.passwordField` | *string* |
`authentication.local.usernameField` | *string* |
`authentication.oauth` | *object* |
`authentication.oauth.defaults` | *object* |
`authentication.oauth.defaults.host` | *string* |
`authentication.oauth.defaults.protocol` | *string* |
`authentication.oauth.facebook` | *object* |
`authentication.oauth.facebook.key` | *string* |
`authentication.oauth.facebook.secret` | *string* |
`authentication.oauth.github` | *object* |
`authentication.oauth.github.key` | *string* |
`authentication.oauth.github.secret` | *string* |
`authentication.oauth.google` | *object* |
`authentication.oauth.google.key` | *string* |
`authentication.oauth.google.scope` | *string*[] |
`authentication.oauth.google.secret` | *string* |
`authentication.oauth.linkedin2` | *object* |
`authentication.oauth.linkedin2.key` | *string* |
`authentication.oauth.linkedin2.scope` | *string*[] |
`authentication.oauth.linkedin2.secret` | *string* |
`authentication.oauth.twitter` | *object* |
`authentication.oauth.twitter.key` | *string* |
`authentication.oauth.twitter.secret` | *string* |
`authentication.secret` | *string* |
`authentication.service` | *string* |
`aws` | *object* |
`aws.cloudfront` | *object* |
`aws.cloudfront.domain` | *string* |
`aws.keys` | *object* |
`aws.keys.accessKeyId` | *string* |
`aws.keys.secretAccessKey` | *string* |
`aws.route53` | *object* |
`aws.route53.hostedZoneId` | *string* |
`aws.route53.keys` | *object* |
`aws.route53.keys.accessKeyId` | *string* |
`aws.route53.keys.secretAccessKey` | *string* |
`aws.s3` | *object* |
`aws.s3.baseUrl` | *string* |
`aws.s3.region` | *string* |
`aws.s3.staticResourceBucket` | *string* |
`aws.sms` | *object* |
`aws.sms.accessKeyId` | *string* |
`aws.sms.applicationId` | *string* |
`aws.sms.region` | *string* |
`aws.sms.secretAccessKey` | *string* |
`aws.sms.senderId` | *string* |
`chargebee` | *object* |
`chargebee.apiKey` | *string* |
`chargebee.url` | *string* |
`client` | *object* |
`client.enabled` | *boolean* |
`client.logo` | *string* |
`client.releaseName` | *string* |
`client.title` | *string* |
`client.url` | *string* |
`db` | *any* |
`deployStage` | *string* |
`email` | *object* |
`email.from` | *string* |
`email.smsNameCharacterLimit` | *number* |
`email.smtp` | *object* |
`email.smtp.auth` | *object* |
`email.smtp.auth.pass` | *string* |
`email.smtp.auth.user` | *string* |
`email.smtp.host` | *string* |
`email.smtp.port` | *number* |
`email.smtp.secure` | *boolean* |
`email.subject` | *object* |
`email.subject.friend` | *string* |
`email.subject.group` | *string* |
`email.subject.login` | *string* |
`email.subject.party` | *string* |
`gameserver` | *object* |
`gameserver.domain` | *string* |
`gameserver.enabled` | *boolean* |
`gameserver.identifierDigits` | *number* |
`gameserver.local` | *boolean* |
`gameserver.mode` | *string* |
`gameserver.port` | *string* \| *number* |
`gameserver.releaseName` | *string* |
`gameserver.rtc_end_port` | *number* |
`gameserver.rtc_port_block_size` | *number* |
`gameserver.rtc_start_port` | *number* |
`redis` | *object* |
`redis.address` | *string* |
`redis.enabled` | *boolean* |
`redis.password` | *string* |
`redis.port` | *string* |
`server` | *object* |
`server.certPath` | *string* |
`server.enabled` | *boolean* |
`server.gaTrackingId` | *string* |
`server.gameserverContainerPort` | *string* \| *number* |
`server.hostname` | *string* |
`server.hub` | *object* |
`server.hub.endpoint` | *string* |
`server.keyPath` | *string* |
`server.local` | *boolean* |
`server.localStorageProvider` | *string* |
`server.mode` | *string* |
`server.nodeModulesDir` | *string* |
`server.paginate` | *object* |
`server.paginate.default` | *number* |
`server.paginate.max` | *number* |
`server.performDryRun` | *boolean* |
`server.port` | *string* \| *number* |
`server.publicDir` | *string* |
`server.releaseName` | *string* |
`server.rootDir` | *string* |
`server.storageProvider` | *string* |
`server.url` | *string* |

Defined in: [packages/server-core/src/appconfig.ts:232](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/server-core/src/appconfig.ts#L232)
