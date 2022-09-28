import dotenv from 'dotenv'
import { DataTypes, Sequelize } from 'sequelize'

import appConfig from './appconfig'
import logger from './ServerLogger'

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
const nonFeathersStrategies = ['emailMagicLink', 'smsMagicLink']

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

//TODO: Environment variables that can be refreshed at runtime
export const refreshAppConfig = async (): Promise<void> => {
  const sequelizeClient = new Sequelize({
    ...(db as any),
    define: {
      freezeTableName: true
    },
    logging: false
  }) as any
  await sequelizeClient.sync()

  const promises: any[] = []

  const serverSetting = sequelizeClient.define('serverSetting', {
    gaTrackingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gitPem: {
      type: DataTypes.STRING(2048),
      allowNull: true
    }
  })

  const serverSettingPromise = serverSetting
    .findAll()
    .then(([dbServer]) => {
      const dbServerConfig = dbServer && {
        gaTrackingId: dbServer.gaTrackingId,
        gitPem: dbServer.gitPem
      }
      appConfig.server = {
        ...appConfig.server,
        ...dbServerConfig
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read serverSetting: ${e.message}`)
    })
  promises.push(serverSettingPromise)
  await Promise.all(promises)
}

export const updateAppConfig = async (): Promise<void> => {
  if (appConfig.db.forceRefresh || !appConfig.kubernetes.enabled) return
  const sequelizeClient = new Sequelize({
    ...(db as any),
    define: {
      freezeTableName: true
    },
    logging: false
  }) as any
  await sequelizeClient.sync()

  const promises: any[] = []

  const analyticsSetting = sequelizeClient.define('analyticsSetting', {
    port: {
      type: DataTypes.STRING,
      allowNull: true
    },
    processInterval: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })
  const analyticsSettingPromise = analyticsSetting
    .findAll()
    .then(([dbAnalytics]) => {
      const dbAnalyticsConfig = dbAnalytics && {
        port: dbAnalytics.port,
        processInterval: dbAnalytics.processInterval
      }
      if (dbAnalyticsConfig) {
        appConfig.analytics = {
          ...appConfig.analytics,
          ...dbAnalyticsConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read analyticsSetting: ${e.message}`)
    })
  promises.push(analyticsSettingPromise)

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
  const authenticationSettingPromise = authenticationSetting
    .findAll()
    .then(([dbAuthentication]) => {
      let oauth = JSON.parse(dbAuthentication.oauth)
      let authStrategies = JSON.parse(dbAuthentication.authStrategies)
      let local = JSON.parse(dbAuthentication.local)
      let jwtOptions = JSON.parse(dbAuthentication.jwtOptions)
      let bearerToken = JSON.parse(dbAuthentication.bearerToken)
      let callback = JSON.parse(dbAuthentication.callback)

      if (typeof oauth === 'string') oauth = JSON.parse(oauth)
      if (typeof authStrategies === 'string') authStrategies = JSON.parse(authStrategies)
      if (typeof local === 'string') local = JSON.parse(local)
      if (typeof jwtOptions === 'string') jwtOptions = JSON.parse(jwtOptions)
      if (typeof bearerToken === 'string') bearerToken = JSON.parse(bearerToken)
      if (typeof callback === 'string') callback = JSON.parse(callback)

      const dbAuthenticationConfig = dbAuthentication && {
        service: dbAuthentication.service,
        entity: dbAuthentication.entity,
        secret: dbAuthentication.secret,
        authStrategies: authStrategies,
        local: local,
        jwtOptions: jwtOptions,
        bearerToken: bearerToken,
        callback: callback,
        oauth: {
          ...oauth
        }
      }
      if (dbAuthenticationConfig) {
        if (oauth.defaults) dbAuthenticationConfig.oauth.defaults = JSON.parse(oauth.defaults)
        if (oauth.discord) dbAuthenticationConfig.oauth.discord = JSON.parse(oauth.discord)
        if (oauth.facebook) dbAuthenticationConfig.oauth.facebook = JSON.parse(oauth.facebook)
        if (oauth.github) dbAuthenticationConfig.oauth.github = JSON.parse(oauth.github)
        if (oauth.google) dbAuthenticationConfig.oauth.google = JSON.parse(oauth.google)
        if (oauth.linkedin) dbAuthenticationConfig.oauth.linkedin = JSON.parse(oauth.linkedin)
        if (oauth.twitter) dbAuthenticationConfig.oauth.twitter = JSON.parse(oauth.twitter)
        const authStrategies = ['jwt', 'local']
        for (let authStrategy of dbAuthenticationConfig.authStrategies) {
          const keys = Object.keys(authStrategy)
          for (let key of keys)
            if (nonFeathersStrategies.indexOf(key) < 0 && authStrategies.indexOf(key) < 0) authStrategies.push(key)
        }
        dbAuthenticationConfig.authStrategies = authStrategies
        appConfig.authentication = {
          ...appConfig.authentication,
          ...dbAuthenticationConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read authenticationSetting: ${e.message}`)
    })
  promises.push(authenticationSettingPromise)

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
  const promisePromise = awsSetting
    .findAll()
    .then(([dbAws]) => {
      let keys = JSON.parse(dbAws.keys)
      let route53 = JSON.parse(dbAws.route53)
      let s3 = JSON.parse(dbAws.s3)
      let cloudfront = JSON.parse(dbAws.cloudfront)
      let sms = JSON.parse(dbAws.sms)

      if (typeof keys === 'string') keys = JSON.parse(keys)
      if (typeof route53 === 'string') route53 = JSON.parse(route53)
      if (typeof s3 === 'string') s3 = JSON.parse(s3)
      if (typeof cloudfront === 'string') cloudfront = JSON.parse(cloudfront)
      if (typeof sms === 'string') sms = JSON.parse(sms)

      const dbAwsConfig = dbAws && {
        keys: keys,
        route53: {
          ...route53,
          keys: JSON.parse(route53.keys)
        },
        s3: s3,
        cloudfront: cloudfront,
        sms: sms
      }
      if (dbAwsConfig) {
        appConfig.aws = {
          ...appConfig.aws,
          ...dbAwsConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read awsSetting: ${e.message}`)
    })
  promises.push(promisePromise)

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
  const chargebeeSettingPromise = chargebeeSetting
    .findAll()
    .then(([dbChargebee]) => {
      const dbChargebeeConfig = dbChargebee && {
        url: dbChargebee.url,
        apiKey: dbChargebee.apiKey
      }
      if (dbChargebeeConfig) {
        appConfig.chargebee = {
          ...appConfig.chargebee,
          ...dbChargebeeConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read chargebeeSetting: ${e.message}`)
    })
  promises.push(chargebeeSettingPromise)

  const coilSetting = sequelizeClient.define('coilSetting', {
    paymentPointer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientSecret: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })
  const coilSettingPromise = coilSetting
    .findAll()
    .then(([dbCoil]) => {
      const dbCoilConfig = dbCoil && {
        url: dbCoil.url,
        apiKey: dbCoil.apiKey
      }
      if (dbCoilConfig) {
        appConfig.coil = {
          ...appConfig.coil,
          ...dbCoilConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read coilSetting: ${e.message}`)
    })
  promises.push(coilSettingPromise)

  const clientSetting = sequelizeClient.define('clientSetting', {
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
  const clientSettingPromise = clientSetting
    .findAll()
    .then(([dbClient]) => {
      const dbClientConfig = dbClient && {
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
      if (dbClientConfig) {
        appConfig.client = {
          ...appConfig.client,
          ...dbClientConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read clientSetting: ${e.message}`)
    })
  promises.push(clientSettingPromise)

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
  const emailSettingPromise = emailSetting
    .findAll()
    .then(([dbEmail]) => {
      let smtp = JSON.parse(dbEmail.smtp)
      let subject = JSON.parse(dbEmail.subject)

      if (typeof smtp === 'string') smtp = JSON.parse(smtp)
      if (typeof subject === 'string') subject = JSON.parse(subject)

      const dbEmailConfig = dbEmail && {
        from: dbEmail.from,
        smsNameCharacterLimit: dbEmail.smsNameCharacterLimit,
        smtp: {
          ...smtp,
          auth: JSON.parse(smtp.auth)
        },
        subject: subject
      }
      if (dbEmailConfig) {
        appConfig.email = {
          ...appConfig.email,
          ...dbEmailConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read emailSetting: ${e.message}`)
    })
  promises.push(emailSettingPromise)

  const instanceServerSetting = sequelizeClient.define('instanceServerSetting', {
    clientHost: {
      type: DataTypes.STRING,
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
  const instanceServerSettingPromise = instanceServerSetting
    .findAll()
    .then(([dbInstanceServer]) => {
      const dbInstanceServerConfig = dbInstanceServer && {
        clientHost: dbInstanceServer.clientHost,
        rtc_start_port: dbInstanceServer.rtc_start_port,
        rtc_end_port: dbInstanceServer.rtc_end_port,
        rtc_port_block_size: dbInstanceServer.rtc_port_block_size,
        identifierDigits: dbInstanceServer.identifierDigits,
        local: dbInstanceServer.local,
        domain: dbInstanceServer.domain,
        releaseName: dbInstanceServer.releaseName,
        port: dbInstanceServer.port,
        mode: dbInstanceServer.mode,
        locationName: dbInstanceServer.locationName
      }
      if (dbInstanceServerConfig) {
        appConfig.instanceserver = {
          ...appConfig.instanceserver,
          ...dbInstanceServerConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read instanceServerSetting: ${e.message}`)
    })
  promises.push(instanceServerSettingPromise)

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
  const redisSettingPromise = redisSetting
    .findAll()
    .then(([dbRedis]) => {
      const dbRedisConfig = dbRedis && {
        enabled: dbRedis.enabled,
        address: dbRedis.address,
        port: dbRedis.port,
        password: dbRedis.password
      }
      if (dbRedisConfig) {
        appConfig.redis = {
          ...appConfig.redis,
          ...dbRedisConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read redisSetting: ${e.message}`)
    })
  promises.push(redisSettingPromise)

  const serverSetting = sequelizeClient.define('serverSetting', {
    hostname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mode: {
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
    gitPem: {
      type: DataTypes.STRING(2048),
      allowNull: true
    },
    local: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    releaseName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    instanceserverUnreachableTimeoutSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    }
  })
  const serverSettingPromise = serverSetting
    .findAll()
    .then(([dbServer]) => {
      let hub = JSON.parse(dbServer.hub)

      if (typeof hub === 'string') hub = JSON.parse(hub)

      const dbServerConfig = dbServer && {
        hostname: dbServer.hostname,
        mode: dbServer.mode,
        port: dbServer.port,
        clientHost: dbServer.clientHost,
        rootDir: dbServer.rootDir,
        publicDir: dbServer.publicDir,
        nodeModulesDir: dbServer.nodeModulesDir,
        localStorageProvider: dbServer.localStorageProvider,
        performDryRun: dbServer.performDryRun,
        storageProvider: dbServer.storageProvider,
        gaTrackingId: dbServer.gaTrackingId,
        url: dbServer.url,
        certPath: dbServer.certPath,
        keyPath: dbServer.keyPath,
        gitPem: dbServer.gitPem,
        local: dbServer.local,
        releaseName: dbServer.releaseName,
        instanceserverUnreachableTimeoutSeconds: dbServer.instanceserverUnreachableTimeoutSeconds,
        hub: hub
      }
      appConfig.server = {
        ...appConfig.server,
        ...dbServerConfig
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read serverSetting: ${e.message}`)
    })
  promises.push(serverSettingPromise)
  await Promise.all(promises)
}
