/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

export const EngineSettings = {
  TaskServer: {
    Port: 'port',
    ProcessInterval: 'processInterval'
  },
  Coil: {
    PaymentPointer: 'paymentPointer',
    ClientId: 'clientId',
    ClientSecret: 'clientSecret'
  },
  Chargebee: {
    ApiKey: 'apiKey',
    Url: 'url'
  },
  InstanceServer: {
    ClientHost: 'clientHost',
    RtcStartPort: 'rtcStartPort',
    RtcEndPort: 'rtcEndPort',
    RtcPortBlockSize: 'rtcPortBlockSize',
    IdentifierDigits: 'identifierDigits',
    Local: 'local',
    Domain: 'domain',
    ReleaseName: 'releaseName',
    Port: 'port',
    Mode: 'mode',
    LocationName: 'locationName',
    WebRTCSettings: 'webRTCSettings',
    ShutdownDelayMs: 'shutdownDelayMs'
  },
  Metabase: {
    SiteUrl: 'siteUrl',
    SecretKey: 'secretKey',
    CrashDashboardId: 'crashDashboardId',
    Expiration: 'expiration',
    Environment: 'environment'
  },
  Redis: {
    Address: 'address',
    Password: 'password',
    Port: 'port',
    Enabled: 'enabled'
  },
  Zendesk: {
    Name: 'name',
    Secret: 'secret',
    Kid: 'kid'
  },
  Helm: {
    Main: 'main',
    Builder: 'builder'
  },
  EmailSetting: {
    Smtp: {
      Host: 'smtp.host',
      Port: 'smtp.port',
      Secure: 'smtp.secure',
      Auth: {
        User: 'smtp.auth.user',
        Pass: 'smtp.auth.pass'
      }
    },
    From: 'from',
    Subject: {
      NewUser: 'subject.new-user',
      Location: 'subject.location',
      Instance: 'subject.instance',
      Login: 'subject.login',
      Friend: 'subject.friend',
      Channel: 'subject.channel'
    },
    SmsNameCharacterLimit: 'smsNameCharacterLimit'
  },
  Server: {
    Mode: 'mode',
    StorageProvider: 'storageProvider',
    Hostname: 'hostname',
    Port: 'port',
    RootDir: 'rootDir',
    PublicDir: 'publicDir',
    NodeModulesDir: 'nodeModulesDir',
    Hub: {
      Endpoint: 'hub.endpoint'
    },
    ClientHost: 'clientHost',
    Url: 'url',
    GitPem: 'gitPem',
    RootDirectory: 'rootDir',
    CertPath: 'certPath',
    PublicDirectory: 'publicDir',
    KeyPath: 'keyPath',
    NodeModulesDirectory: 'nodeModulesDir',
    GithubWebhookSecret: 'githubWebhookSecret',
    LocalStorageProvider: 'localStorageProvider',
    ReleaseName: 'releaseName',
    InstanceserverUnreachableTimeoutSeconds: 'instanceserverUnreachableTimeoutSeconds',
    PerformDryRun: 'performDryRun',
    Local: 'local'
  },
  Aws: {
    S3: {
      AccessKeyId: 's3.accessKeyId',
      SecretAccessKey: 's3.secretAccessKey',
      Endpoint: 's3.endpoint',
      StaticResourceBucket: 's3.staticResourceBucket',
      Region: 's3.region',
      AvatarDir: 's3.avatarDir',
      RoleArn: 's3.roleArn',
      S3DevMode: 's3.s3DevMode'
    },
    CloudFront: {
      Domain: 'cloudfront.domain',
      DistributionId: 'cloudfront.distributionId',
      Region: 'cloudfront.region'
    },
    SMS: {
      AccessKeyId: 'sms.accessKeyId',
      ApplicationId: 'sms.applicationId',
      Region: 'sms.region',
      SenderId: 'sms.senderId',
      SecretAccessKey: 'sms.secretAccessKey'
    },
    EKS: {
      AccessKeyId: 'eks.accessKeyId',
      SecretAccessKey: 'eks.secretAccessKey',
      RoleArn: 'eks.roleArn'
    }
  },
  Authentication: {
    service: 'service',
    entity: 'entity',
    secret: 'secret',
    AuthStrategies: {
      Jwt: 'authStrategies.[0].jwt',
      SmsMagicLink: 'authStrategies.[1].smsMagicLink',
      EmailMagicLink: 'authStrategies.[2].emailMagicLink',
      Apple: 'authStrategies.[3].apple',
      Discord: 'authStrategies.[4].discord',
      Facebook: 'authStrategies.[5].facebook',
      Github: 'authStrategies.[6].github',
      Google: 'authStrategies.[7].google',
      Linkedin: 'authStrategies.[8].linkedin',
      Twitter: 'authStrategies.[9].twitter',
      DidWallet: 'authStrategies.[10].didWallet'
    },
    JwtAlgorithm: 'jwtAlgorithm',
    JwtPublicKey: 'jwtPublicKey',
    JwtOptions: { Algorithm: 'jwtOptions.algorithm', ExpiresIn: 'jwtOptions.expiresIn' },
    Oauth: {
      Default: {
        Host: 'oauth.default.host',
        Protocol: 'oauth.default.protocol'
      },
      Apple: {
        Key: 'oauth.apple.key',
        Secret: 'oauth.apple.secret',
        Scope: {
          OpenId: 'oauth.apple.scope.[0]',
          Email: 'oauth.apple.scope.[1]',
          Name: 'oauth.apple.scope.[2]'
        },
        Response: {
          Raw: 'oauth.apple.response.[0]',
          Jwt: 'oauth.apple.response.[1]'
        }
      },
      Nonce: true,
      CustomParams: {
        ResponseType: 'code id_token',
        ResponseMode: 'form_post'
      }
    }
  }
}
