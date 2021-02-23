/* eslint-disable @typescript-eslint/restrict-template-expressions */
import path from 'path';
import url from 'url';
import { inspect } from 'util';
// Load all the ENV variables from `.env`, then `.env.local`, into process.env
import dotenv from 'dotenv-flow';
import * as chargebeeInst from 'chargebee';
import appRootPath from 'app-root-path';
if (process.env.KUBERNETES !== 'true') {
  dotenv.config({
    path: appRootPath.path
  });
}

/**
 * Database
 */
export const db: any = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xr3ngine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  forceRefresh: process.env.FORCE_DB_REFRESH === 'true',
  url: '',
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci'
};
db.url = process.env.MYSQL_URL ??
  `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;

/**
 * Server / backend
 */
const server = {
  enabled: process.env.SERVER_ENABLED === 'true' ?? true,
  mode: process.env.SERVER_MODE ?? 'local',
  hostname: process.env.SERVER_HOSTNAME ?? '127.0.0.1',
  port: process.env.SERVER_PORT ?? 3030,
  // Public directory (used for favicon.ico, logo, etc)
  rootDir: path.resolve(appRootPath.path, 'packages', 'server'),
  publicDir: process.env.SERVER_PUBLIC_DIR ?? path.resolve(appRootPath.path, 'packages', 'server', 'public'),
  nodeModulesDir: path.resolve(__dirname, '../..', 'node_modules'),
  localStorageProvider: process.env.LOCAL_STORAGE_PROVIDER ?? '',
  // Used for CI/tests to force Sequelize init an empty database
  performDryRun: process.env.PERFORM_DRY_RUN === 'true',
  storageProvider: process.env.STORAGE_PROVIDER ?? 'local',
  gaTrackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID ?? '',
  hub: {
    endpoint: process.env.HUB_ENDPOINT ?? 'https://xr3ngine.io'
  },
  paginate: {
    default: 10,
    max: 100
  },
  url: '',
  certPath: path.resolve(path.dirname("./"), process.env.CERT ?? 'certs/cert.pem'),
  keyPath: path.resolve(path.dirname("./"), process.env.KEY ?? 'certs/key.pem'),
  local: process.env.LOCAL === 'true',
  gameserverContainerPort: process.env.GAMESERVER_CONTAINER_PORT ?? 3030,
  releaseName: process.env.RELEASE_NAME ?? ''
};
const obj = process.env.KUBERNETES === 'true' ? { protocol: 'https', hostname: server.hostname }: { protocol: 'https', ...server };
server.url = process.env.SERVER_URL ?? url.format(obj);

/**
 * Client / frontend
 */
const client = {
  enabled: process.env.CLIENT_ENABLED === 'true' ?? true,
  // Client app logo
  // FIXME - change to XR3ngine logo
  logo: process.env.APP_LOGO ?? 'https://xr3ngine-static.s3-us-east-1.amazonaws.com/logo.png',
  // Client app name
  // FIXME - change to XR3ngine
  title: process.env.APP_LOGO ?? 'XR3ngine',
  url: process.env.APP_URL ??
    process.env.APP_HOST ?? // Legacy env var, to deprecate
    'https://127.0.0.1:3000',
  releaseName: process.env.RELEASE_NAME ?? ''
};

const gameserver = {
  rtc_start_port: process.env.RTC_START_PORT ? parseInt(process.env.RTC_START_PORT) : 40000,
  rtc_end_port: process.env.RTC_END_PORT ? parseInt(process.env.RTC_END_PORT) : 40099,
  rtc_port_block_size: process.env.RTC_PORT_BLOCK_SIZE ? parseInt(process.env.RTC_PORT_BLOCK_SIZE) : 100,
  identifierDigits: 5,
  local: process.env.LOCAL === 'true',
  domain: process.env.GAMESERVER_DOMAIN ?? 'gameserver.theoverlay.io',
  releaseName: process.env.RELEASE_NAME ?? ''
};

/**
 * Email / SMTP
 */
const email = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: (process.env.SMTP_PORT) ? +process.env.SMTP_PORT : 2525,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  // Name and email of default sender (for login emails, etc)
  from: `${process.env.SMTP_FROM_NAME ?? 'XR3ngine'}` +
    ` <${process.env.SMTP_FROM_EMAIL ?? 'noreply@myxr.email'}>`,
  subject: {
    // Subject of the Login Link email
    login: 'XR3ngine login link',
    friend: 'XR3ngine friend request',
    group: 'XR3ngine group invitation',
    party: 'XR3ngine party invitation'
  },
  smsNameCharacterLimit: 20
};

/**
 * Authentication
 */
const authentication = {
  service: 'identity-provider',
  entity: 'identity-provider',
  secret: process.env.AUTH_SECRET ?? '',
  authStrategies: [
    'jwt',
    'local',
    'facebook',
    'github',
    'google',
    'linkedin'
  ],
  local: {
    usernameField: 'email',
    passwordField: 'password'
  },
  jwtOptions: {
    expiresIn: '30 days'
  },
  bearerToken: {
    numBytes: 16
  },
  callback: {
    facebook: process.env.FACEBOOK_CALLBACK_URL ?? `${client.url}/auth/oauth/facebook`,
    github: process.env.GITHUB_CALLBACK_URL ?? `${client.url}/auth/oauth/github`,
    google: process.env.GOOGLE_CALLBACK_URL ?? `${client.url}/auth/oauth/google`,
    linkedin: process.env.LINKEDIN_CALLbACK_URL ?? `${client.url}/auth/oauth/linkedlin`,
  },
  oauth: {
    defaults: {
      host: server.hostname && server.hostname !== '127.0.0.1' ? (server.hostname) : '127.0.0.1:3030',
      protocol: 'https'
    },
    facebook: {
      key: process.env.FACEBOOK_CLIENT_ID ?? '',
      secret: process.env.FACEBOOK_CLIENT_SECRET ?? ''
    },
    github: {
      key: process.env.GITHUB_CLIENT_ID ?? '',
      secret: process.env.GITHUB_CLIENT_SECRET ?? ''
    },
    google: {
      key: process.env.GOOGLE_CLIENT_ID ?? '',
      secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      scope: ['profile', 'email']
    },
    linkedin: {
      key: process.env.LINKEDIN_CLIENT_ID ?? '',
      secret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
    }
  }
};

/**
 * AWS
 */
const aws = {
  keys: {
    accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET ?? ''
  },
  route53: {
    hostedZoneId: process.env.ROUTE53_HOSTED_ZONE_ID ?? '',
    keys: {
      accessKeyId: process.env.ROUTE53_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.ROUTE53_ACCESS_KEY_SECRET ?? ''
    }
  },
  s3: {
    baseUrl: 'https://s3.amazonaws.com',
    staticResourceBucket: process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET ?? 'default',
    region: process.env.STORAGE_S3_REGION ?? 'us-east-1'
  },
  cloudfront: {
    domain: process.env.STORAGE_CLOUDFRONT_DOMAIN ?? ''
  },
  sms: {
    accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID ?? '',
    applicationId: process.env.AWS_SMS_APPLICATION_ID ?? '',
    region: process.env.AWS_SMS_REGION ?? '',
    senderId: process.env.AWS_SMS_SENDER_ID ?? '',
    secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY ?? ''
  }
};

const chargebee = {
  url: process.env.CHARGEBEE_SITE + '.chargebee.com' ?? 'dummy.not-chargebee.com',
  apiKey: process.env.CHARGEBEE_API_KEY ?? ''
};

const redis = {
  enabled: process.env.REDIS_ENABLED === 'true' ?? false,
  address: process.env.REDIS_ADDRESS ?? '127.0.0.1',
  port: process.env.REDIS_PORT ?? '6379',
  password: process.env.REDIS_PASSWORD ?? null
};

/**
 * Full config
 */
const config = {
  deployStage: process.env.DEPLOY_STAGE ?? 'local',
  authentication,
  aws,
  chargebee,
  client,
  db,
  email,
  gameserver,
  server,
  redis
};

chargebeeInst.configure({
  site: process.env.CHARGEBEE_SITE ?? '',
  api_key: config.chargebee.apiKey
});

export default config;
