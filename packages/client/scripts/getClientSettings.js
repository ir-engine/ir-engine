import { DataTypes, Sequelize } from 'sequelize'

export const getClientSetting = async () => {

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
  const sequelizeClient = new Sequelize({
    ...db,
    define: {
      freezeTableName: true
    },
    logging: false
  })
  await sequelizeClient.sync()
  const clientSettingSchema = sequelizeClient.define('clientSetting', {
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

  const clientSetting = await clientSettingSchema
    .findAll()
    .then(([dbClient]) => {
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
      } || {
        enabled: true,
        logo: './logo.svg',
        title: 'XREngine',
        url: 'https://local.theoverlay.io',
        releaseName: 'local',
        siteDescription: 'Connected Worlds for Everyone',
        favicon32px: '/favicon-32x32.png',
        favicon16px: '/favicon-16x16.png',
        icon192px: '/android-chrome-192x192.png',
        icon512px: '/android-chrome-512x512.png'
      }
      if (dbClientConfig) {
        return dbClientConfig
      }
    })
    .catch((e) => {
      console.warn('[vite.config.js]: Failed to read clientSetting')
      console.warn(e)
    })

  return clientSetting

}