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
const db: any = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrchat',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  forceRefresh: process.env.FORCE_DB_REFRESH === 'true'
}
db.url = process.env.MYSQL_URL ??
  `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

/**
 * Server / backend
 */
const server: any = {
  hostname: process.env.SERVER_HOSTNAME ?? 'localhost',
  port: process.env.SERVER_PORT ?? 3030,
  // Public directory (used for favicon.ico, logo, etc)
  publicDir: process.env.SERVER_PUBLIC_DIR ?? path.resolve(__dirname, '..', 'public'),
  // Used for CI/tests to force Sequelize init an empty database
  performDryRun: process.env.PERFORM_DRY_RUN ?? false,
  storageProvider: process.env.STORAGE_PROVIDER ?? 'aws'
}
server.url = process.env.SERVER_URL ??
  url.format({ protocol: 'https', ...server })

/**
 * Client / frontend
 */
const client: any = {
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
const email: any = {
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
const authentication: any = {
  service: 'identity-provider',
  callback: {
    facebook: process.env.FACEBOOK_CALLBACK_URL ?? `${client.url}/oauth/facebook`,
    github: process.env.GITHUB_CALLBACK_URL ?? `${client.url}/oauth/github`,
    google: process.env.GOOGLE_CALLBACK_URL ?? `${client.url}/oauth/google`
  }
}

/**
 * AWS
 */
const aws: any = {
  sms: {
    region: process.env.AWS_SMS_REGION ?? '',
    accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY ?? ''
  }
}

/**
 * Full config
 */
const config: any = {
  authentication,
  aws,
  client,
  db,
  email,
  server
}

console.log(inspect(config))

export default config
