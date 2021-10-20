import dotenv from 'dotenv-flow'
import appRootPath from 'app-root-path'
import * as chargebeeInst from 'chargebee'
import path from 'path'
import url from 'url'

const kubernetesEnabled = process.env.KUBERNETES === 'true'

if (globalThis.process?.env.APP_ENV === 'development') {
  var fs = require('fs')
  if (!fs.existsSync(appRootPath.path + '/.env') && !fs.existsSync(appRootPath.path + '/.env.local')) {
    var fromEnvPath = appRootPath.path + '/.env.local.default'
    var toEnvPath = appRootPath.path + '/.env.local'
    fs.copyFileSync(fromEnvPath, toEnvPath, fs.constants.COPYFILE_EXCL)
  }
}

if (!kubernetesEnabled) {
  dotenv.config({
    path: appRootPath.path,
    silent: true
  })
}

/**
 * Database
 */
export const db: any = {
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  dialect: 'mysql',
  forceRefresh: process.env.FORCE_DB_REFRESH === 'true',
  url: '',
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
  pool: {
    max: parseInt(process.env.SEQUELIZE_POOL_MAX || '5')
  }
}
db.url = process.env.MYSQL_URL || `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

/**
 * Server / backend
 */
const server = {
  enabled: process.env.SERVER_ENABLED === 'true',
  mode: process.env.SERVER_MODE,
  hostname: process.env.SERVER_HOST,
  port: process.env.SERVER_PORT,
  clientHost: process.env.APP_HOST,
  // Public directory (used for favicon.ico, logo, etc)
  rootDir:
    process.env.BUILD_MODE === 'individual'
      ? path.resolve(appRootPath.path)
      : path.resolve(appRootPath.path, 'packages', 'server'),
  publicDir:
    process.env.SERVER_PUBLIC_DIR ||
    (process.env.BUILD_MODE === 'individual'
      ? path.resolve(appRootPath.path, 'public')
      : path.resolve(appRootPath.path, 'packages', 'server', 'public')),
  nodeModulesDir: path.resolve(__dirname, '../..', 'node_modules'),
  localStorageProvider: process.env.LOCAL_STORAGE_PROVIDER,
  // Used for CI/tests to force Sequelize init an empty database
  performDryRun: process.env.PERFORM_DRY_RUN === 'true',
  storageProvider: process.env.STORAGE_PROVIDER,
  gaTrackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
  hub: {
    endpoint: process.env.HUB_ENDPOINT
  },
  paginate: {
    default: 10,
    max: 100
  },
  url: '',
  certPath: appRootPath.path.toString() + '/' + process.env.CERT,
  keyPath: appRootPath.path.toString() + '/' + process.env.KEY,
  local: process.env.LOCAL === 'true',
  releaseName: process.env.RELEASE_NAME,
  defaultContentPackURL: process.env.DEFAULT_CONTENT_PACK_URL
}
const obj = kubernetesEnabled ? { protocol: 'https', hostname: server.hostname } : { protocol: 'https', ...server }
server.url = process.env.SERVER_URL || url.format(obj)

/**
 * Client / frontend
 */
const client = {
  enabled: process.env.CLIENT_ENABLED === 'true',
  logo: process.env.APP_LOGO,
  title: process.env.APP_TITLE,
  url:
    process.env.APP_URL ||
    (process.env.LOCAL_BUILD
      ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
      : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
  releaseName: process.env.RELEASE_NAME
}

const gameserver = {
  clientHost: process.env.APP_HOST,
  enabled: process.env.GAMESERVER_ENABLED === 'true',
  rtc_start_port: parseInt(process.env.RTC_START_PORT),
  rtc_end_port: parseInt(process.env.RTC_END_PORT),
  rtc_port_block_size: parseInt(process.env.RTC_PORT_BLOCK_SIZE),
  identifierDigits: 5,
  local: process.env.LOCAL === 'true',
  domain: process.env.GAMESERVER_DOMAIN || 'gameserver.theoverlay.io',
  releaseName: process.env.RELEASE_NAME,
  port: process.env.GAMESERVER_PORT,
  mode: process.env.SERVER_MODE,
  locationName: process.env.PRELOAD_LOCATION_NAME
}

/**
 * Analytics generator
 */
const analytics = {
  enabled: process.env.ANALYTICS_ENABLED === 'true',
  port: process.env.ANALYTICS_PORT,
  processInterval: process.env.ANALYTICS_PROCESS_INTERVAL_SECONDS
}

/**
 * Email / SMTP
 */
const email = {
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  // Name and email of default sender (for login emails, etc)
  from: `${process.env.SMTP_FROM_NAME}` + ` <${process.env.SMTP_FROM_EMAIL}>`,
  subject: {
    // Subject of the Login Link email
    login: 'Creator login link',
    friend: 'Creator friend request',
    group: 'Creator group invitation',
    party: 'Creator party invitation'
  },
  smsNameCharacterLimit: 20
}

/**
 * Authentication
 */
const authentication = {
  service: 'identity-provider',
  entity: 'identity-provider',
  secret: process.env.AUTH_SECRET,
  authStrategies: ['jwt', 'local', 'facebook', 'github', 'google', 'linkedin', 'twitter'],
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
    facebook: process.env.FACEBOOK_CALLBACK_URL || `${client.url}/auth/oauth/facebook`,
    github: process.env.GITHUB_CALLBACK_URL || `${client.url}/auth/oauth/github`,
    google: process.env.GOOGLE_CALLBACK_URL || `${client.url}/auth/oauth/google`,
    linkedin: process.env.LINKEDIN_CALLBACK_URL || `${client.url}/auth/oauth/linkedin`,
    twitter: process.env.TWITTER_CALLBACK_URL || `${client.url}/auth/oauth/twitter`
  },
  oauth: {
    defaults: {
      host:
        server.hostname !== '127.0.0.1' && server.hostname !== 'localhost'
          ? server.hostname
          : server.hostname + ':' + server.port,
      protocol: 'https'
    },
    facebook: {
      key: process.env.FACEBOOK_CLIENT_ID,
      secret: process.env.FACEBOOK_CLIENT_SECRET
    },
    github: {
      key: process.env.GITHUB_CLIENT_ID,
      secret: process.env.GITHUB_CLIENT_SECRET
    },
    google: {
      key: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
      scope: ['profile', 'email']
    },
    linkedin: {
      key: process.env.LINKEDIN_CLIENT_ID,
      secret: process.env.LINKEDIN_CLIENT_SECRET,
      scope: ['r_liteprofile', 'r_emailaddress']
    },
    twitter: {
      key: process.env.TWITTER_CLIENT_ID,
      secret: process.env.TWITTER_CLIENT_SECRET
    }
  }
}

/**
 * AWS
 */
const aws = {
  keys: {
    accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET
  },
  route53: {
    hostedZoneId: process.env.ROUTE53_HOSTED_ZONE_ID,
    keys: {
      accessKeyId: process.env.ROUTE53_ACCESS_KEY_ID,
      secretAccessKey: process.env.ROUTE53_ACCESS_KEY_SECRET
    }
  },
  s3: {
    baseUrl: 'https://s3.amazonaws.com',
    staticResourceBucket: process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET,
    region: process.env.STORAGE_S3_REGION,
    avatarDir: process.env.STORAGE_S3_AVATAR_DIRECTORY,
    s3DevMode: process.env.STORAGE_S3_DEV_MODE
  },
  cloudfront: {
    domain: process.env.STORAGE_CLOUDFRONT_DOMAIN,
    distributionId: process.env.STORAGE_CLOUDFRONT_DISTRIBUTION_ID
  },
  sms: {
    accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID,
    applicationId: process.env.AWS_SMS_APPLICATION_ID,
    region: process.env.AWS_SMS_REGION,
    senderId: process.env.AWS_SMS_SENDER_ID,
    secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY
  }
}

const chargebee = {
  url: process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com',
  apiKey: process.env.CHARGEBEE_API_KEY
}

const redis = {
  enabled: process.env.REDIS_ENABLED === 'true',
  address: process.env.REDIS_ADDRESS,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD == '' || process.env.REDIS_PASSWORD == null ? null : process.env.REDIS_PASSWORD
}

/**
 * Scope
 */
const scopes = {
  guest: process.env.DEFAULT_GUEST_SCOPES?.split(',') || [],
  user: process.env.DEFAULT_USER_SCOPES?.split(',') || []
}

/**
 * Full config
 */
const config = {
  deployStage: process.env.DEPLOY_STAGE,
  analytics,
  authentication,
  aws,
  chargebee,
  client,
  db,
  email,
  gameserver,
  server,
  redis,
  scopes,
  kubernetes: {
    enabled: kubernetesEnabled,
    serviceHost: process.env.KUBERNETES_SERVICE_HOST,
    tcpPort: process.env.KUBERNETES_PORT_443_TCP_PORT
  },
  noSSL: process.env.NOSSL === 'true',
  localBuild: process.env.LOCAL_BUILD === 'true'
}

chargebeeInst.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: config.chargebee.apiKey
})

export default config
