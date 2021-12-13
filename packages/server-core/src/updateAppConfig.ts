import dotenv from 'dotenv'
import { DataTypes, Sequelize } from 'sequelize'

import appConfig from './appconfig'

dotenv.config()
const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'xrengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

export const updateAppConfig = async (): Promise<void> => {
  const sequelizeClient = new Sequelize({
    ...(db as any),
    define: {
      freezeTableName: true
    }
  }) as any
  await sequelizeClient.sync()

  const analyticsSetting = sequelizeClient.define('analyticsSetting', {
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    processInterval: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const authenticationSetting = sequelizeClient.define('authentication', {
    service: {
      type: DataTypes.STRING,
      allowNull: true
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authStrategies: {
      type: DataTypes.JSON,
      allowNull: true
    },
    local: {
      type: DataTypes.JSON,
      allowNull: true
    },
    jwtOptions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    bearerToken: {
      type: DataTypes.JSON,
      allowNull: true
    },
    callback: {
      type: DataTypes.JSON,
      allowNull: true
    },
    oauth: {
      type: DataTypes.JSON,
      allowNull: true
    }
  })

  const awsSetting = sequelizeClient.define('Aws', {
    keys: {
      type: DataTypes.JSON,
      allowNull: true
    },
    route53: {
      type: DataTypes.JSON,
      allowNull: true
    },
    s3: {
      type: DataTypes.JSON,
      allowNull: true
    },
    cloudfront: {
      type: DataTypes.JSON,
      allowNull: true
    },
    sms: {
      type: DataTypes.JSON,
      allowNull: true
    }
  })

  const chargebeeSetting = sequelizeClient.define('chargebeeSetting', {
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const clientSetting = sequelizeClient.define('clientSetting', {
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    releaseName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    siteDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    favicon32px: {
      type: DataTypes.STRING,
      allowNull: true
    },
    favicon16px: {
      type: DataTypes.STRING,
      allowNull: true
    },
    icon192px: {
      type: DataTypes.STRING,
      allowNull: true
    },
    icon512px: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const emailSetting = sequelizeClient.define('emailSetting', {
    smtp: {
      type: DataTypes.JSON,
      allowNull: true
    },
    from: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject: {
      type: DataTypes.JSON,
      allowNull: true
    },
    smsNameCharacterLimit: {
      type: DataTypes.INTEGER
    }
  })

  const gameServerSetting = sequelizeClient.define('gameServerSetting', {
    clientHost: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    rtc_start_port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rtc_end_port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rtc_port_block_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    identifierDigits: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    local: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true
    },
    releaseName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    locationName: {
      type: DataTypes.STRING
    }
  })

  const redisSetting = sequelizeClient.define('redisSetting', {
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const serverSetting = sequelizeClient.define('serverSetting', {
    hostname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serverEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    serverMode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientHost: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rootDir: {
      type: DataTypes.STRING,
      allowNull: true
    },
    publicDir: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nodeModulesDir: {
      type: DataTypes.STRING,
      allowNull: true
    },
    localStorageProvider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    performDryRun: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    storageProvider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gaTrackingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hub: {
      type: DataTypes.JSON,
      allowNull: true
    },
    paginate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
      validate: {
        max: 100
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    certPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    keyPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    local: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    releaseName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const [dbAnalytics] = await analyticsSetting.findAll()
  const [dbAuthentication] = await authenticationSetting.findAll()
  const [dbAws] = await awsSetting.findAll()
  const [dbChargebee] = await chargebeeSetting.findAll()
  const [dbClient] = await clientSetting.findAll()
  const [dbEmail] = await emailSetting.findAll()
  const [dbGameServer] = await gameServerSetting.findAll()
  const [dbRedis] = await redisSetting.findAll()
  const [dbServer] = await serverSetting.findAll()

  const dbAnalyticsConfig = dbAnalytics && {
    port: dbAnalytics.port,
    enabled: dbAnalytics.enabled,
    processInterval: dbAnalytics.processInterval
  }

  const dbAuthenticationConfig = dbAuthentication && {
    service: dbAuthentication.service,
    entity: dbAuthentication.entity,
    secret: dbAuthentication.secret,
    authStrategies: JSON.parse(JSON.parse(dbAuthentication.authStrategies)),
    local: JSON.parse(JSON.parse(dbAuthentication.local)),
    jwtOptions: JSON.parse(JSON.parse(dbAuthentication.jwtOptions)),
    bearerToken: JSON.parse(JSON.parse(dbAuthentication.bearerToken)),
    callback: JSON.parse(JSON.parse(dbAuthentication.callback)),
    oauth: {
      ...JSON.parse(JSON.parse(dbAuthentication.oauth)),
      defaults: JSON.parse(JSON.parse(JSON.parse(dbAuthentication.oauth)).defaults),
      facebook: JSON.parse(JSON.parse(JSON.parse(dbAuthentication.oauth)).facebook),
      github: JSON.parse(JSON.parse(JSON.parse(dbAuthentication.oauth)).github),
      google: JSON.parse(JSON.parse(JSON.parse(dbAuthentication.oauth)).google),
      linkedin: JSON.parse(JSON.parse(JSON.parse(dbAuthentication.oauth)).linkedin),
      twitter: JSON.parse(JSON.parse(JSON.parse(dbAuthentication.oauth)).twitter)
    }
  }

  const dbAwsConfig = dbAws && {
    keys: JSON.parse(JSON.parse(dbAws.keys)),
    route53: {
      ...JSON.parse(JSON.parse(dbAws.route53)),
      keys: JSON.parse(JSON.parse(JSON.parse(dbAws.route53)).keys)
    },
    s3: JSON.parse(JSON.parse(dbAws.s3)),
    cloudfront: JSON.parse(JSON.parse(dbAws.cloudfront)),
    sms: JSON.parse(JSON.parse(dbAws.sms))
  }

  const dbChargebeeConfig = dbChargebee && {
    url: dbChargebee.url,
    apiKey: dbChargebee.apiKey
  }

  const dbClientConfig = dbClient && {
    enabled: dbClient.enabled,
    logo: dbClient.logo,
    title: dbClient.title,
    url: dbClient.url,
    releaseName: dbClient.releaseName,
    siteDescription: dbClient.siteDescription,
    favicon32px: dbClient.favicon32px,
    favicon16px: dbClient.favicon16px,
    icon192px: dbClient.icon192px,
    icon512px: dbClient.icon512px
  }

  const dbEmailConfig = dbEmail && {
    from: dbEmail.from,
    smsNameCharacterLimit: dbEmail.smsNameCharacterLimit,
    smtp: {
      ...JSON.parse(JSON.parse(dbEmail.smtp)),
      auth: JSON.parse(JSON.parse(JSON.parse(dbEmail.smtp)).auth)
    },
    subject: JSON.parse(JSON.parse(dbEmail.subject))
  }

  const dbGameServerConfig = dbGameServer && {
    clientHost: dbGameServer.clientHost,
    enabled: dbGameServer.enabled,
    rtc_start_port: dbGameServer.rtc_start_port,
    rtc_end_port: dbGameServer.rtc_end_port,
    rtc_port_block_size: dbGameServer.rtc_port_block_size,
    identifierDigits: dbGameServer.identifierDigits,
    local: dbGameServer.local,
    domain: dbGameServer.domain,
    releaseName: dbGameServer.releaseName,
    port: dbGameServer.port,
    mode: dbGameServer.mode,
    locationName: dbGameServer.locationName
  }

  const dbRedisConfig = dbRedis && {
    enabled: dbRedis.enabled,
    address: dbRedis.address,
    port: dbRedis.port,
    password: dbRedis.password
  }

  const dbServerConfig = dbServer && {
    hostname: dbServer.hostname,
    serverEnabled: dbServer.serverEnabled,
    serverMode: dbServer.serverMode,
    port: dbServer.port,
    clientHost: dbServer.clientHost,
    rootDir: dbServer.rootDir,
    publicDir: dbServer.publicDir,
    nodeModulesDir: dbServer.nodeModulesDir,
    localStorageProvider: dbServer.localStorageProvider,
    performDryRun: dbServer.performDryRun,
    storageProvider: dbServer.storageProvider,
    gaTrackingId: dbServer.gaTrackingId,
    paginate: dbServer.paginate,
    url: dbServer.url,
    certPath: dbServer.certPath,
    keyPath: dbServer.keyPath,
    local: dbServer.local,
    releaseName: dbServer.releaseName,
    hub: JSON.parse(JSON.parse(dbServer.hub))
  }

  if (dbAnalyticsConfig) {
    appConfig.analytics = {
      ...appConfig.analytics,
      ...dbAnalyticsConfig
    }
  }

  if (dbAuthenticationConfig) {
    appConfig.authentication = {
      ...appConfig.authentication,
      ...dbAuthenticationConfig
    }
  }

  if (dbAwsConfig) {
    appConfig.aws = {
      ...appConfig.aws,
      ...dbAwsConfig
    }
  }

  if (dbChargebeeConfig) {
    appConfig.chargebee = {
      ...appConfig.chargebee,
      ...dbChargebeeConfig
    }
  }

  if (dbClientConfig) {
    appConfig.client = {
      ...appConfig.client,
      ...dbClientConfig
    }
  }

  if (dbEmailConfig) {
    appConfig.email = {
      ...appConfig.email,
      ...dbEmailConfig
    }
  }

  if (dbGameServerConfig) {
    appConfig.gameserver = {
      ...appConfig.gameserver,
      ...dbGameServerConfig
    }
  }

  if (dbRedisConfig) {
    appConfig.redis = {
      ...appConfig.redis,
      ...dbRedisConfig
    }
  }

  if (dbServerConfig) {
    appConfig.server = {
      ...appConfig.server,
      ...dbServerConfig
    }
  }
}
