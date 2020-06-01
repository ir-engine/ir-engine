/* eslint-disable @typescript-eslint/restrict-template-expressions */
import path from 'path'
import url from 'url'
import { inspect } from 'util'
// Load all the ENV variables from `.env`, then `.env.local`, into process.env
import dotenv from 'dotenv-flow'
dotenv.config()

/**
 * Database
 */
const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrchat',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  forceRefresh: process.env.FORCE_DB_REFRESH === 'true',
  url: ''
}
db.url = process.env.MYSQL_URL ??
  `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

/**
 * Server / backend
 */
const server = {
  mode: process.env.SERVER_MODE ?? 'media',
  hostname: process.env.SERVER_HOSTNAME ?? 'localhost',
  port: process.env.SERVER_PORT ?? 3030,
  // Public directory (used for favicon.ico, logo, etc)
  publicDir: process.env.SERVER_PUBLIC_DIR ?? path.resolve(__dirname, '..', 'public'),
  // Used for CI/tests to force Sequelize init an empty database
  performDryRun: process.env.PERFORM_DRY_RUN === 'true',
  storageProvider: process.env.STORAGE_PROVIDER ?? 'aws',
  gaTrackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID ?? '',
  sketchFab: {
    authToken: process.env.SKETCH_FAB_AUTH_TOKEN ?? ''
  },
  googlePoly: {
    authToken: process.env.GOOGLE_POLY_AUTH_TOKEN ?? ''
  },
  hub: {
    endpoint: process.env.HUB_ENDPOINT ?? 'https://hubs.mozilla.com'
  },
  paginate: {
    default: 10,
    max: 100
  },
  url: ''
}
server.url = process.env.SERVER_URL ??
  url.format({ protocol: 'https', ...server })

/**
 * Client / frontend
 */
const client = {
  // Client app logo
  // FIXME - change to XR3ngine logo
  logo: process.env.APP_LOGO ?? 'https://kaixr-static.s3-us-west-2.amazonaws.com/logo.png',
  // Client app name
  // FIXME - change to XR3ngine
  title: process.env.APP_LOGO ?? 'KaiXR',
  url: process.env.APP_URL ??
    process.env.APP_HOST ?? // Legacy env var, to deprecate
    'http://localhost:3000'
}

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
    login: 'Your login link'
  }
}

/**
 * Authentication
 */
const authentication = {
  service: 'identity-provider',
  entity: 'identity-provider',
  secret: process.env.AUTH_SECRET ?? '',
  local: {
    usernameField: 'email',
    passwordField: 'password'
  },
  callback: {
    facebook: process.env.FACEBOOK_CALLBACK_URL ?? `${client.url}/oauth/facebook`,
    github: process.env.GITHUB_CALLBACK_URL ?? `${client.url}/oauth/github`,
    google: process.env.GOOGLE_CALLBACK_URL ?? `${client.url}/oauth/google`
  }
}

/**
 * AWS
 */
const aws = {
  keys: {
    accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET ?? ''
  },
  s3: {
    baseUrl: 'https://s3.amazonaws.com',
    staticResourceBucket: process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET ?? 'default',
    region: process.env.STORAGE_S3_REGION ?? 'us-east-1',
    cloudfront: {
      domain: process.env.STORAGE_S3_CLOUDFRONT_DOMAIN ?? ''
    }
  },
  sms: {
    accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID ?? '',
    applicationId: process.env.AWS_SMS_APPLICATION_ID ?? '',
    region: process.env.AWS_SMS_REGION ?? '',
    senderId: process.env.AWS_SMS_SENDER_ID ?? '',
    secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY ?? ''
  }
}

/**
 * Full config
 */
const config = {
  authentication,
  aws,
  client,
  db,
  email,
  server
}

console.log(inspect(config))

export default config
