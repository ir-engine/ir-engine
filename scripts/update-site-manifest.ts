import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import path from 'path'
import { DataTypes, Sequelize } from 'sequelize'

import config from '@etherealengine/server-core/src/appconfig'
import { getCacheDomain } from '@etherealengine/server-core/src/media/storageprovider/getCacheDomain'
import {
  createDefaultStorageProvider,
  getStorageProvider
} from '@etherealengine/server-core/src/media/storageprovider/storageprovider'
import { getContentType } from '@etherealengine/server-core/src/util/fileUtils'

const kubernetesEnabled = process.env.KUBERNETES === 'true'
if (!kubernetesEnabled) {
  dotenv.config({
    path: appRootPath.path,
    silent: true
  })
}

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'etherealengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql'
} as any

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const sequelize = new Sequelize({
  ...db,
  logging: console.log,
  define: {
    freezeTableName: true
  }
})

cli.main(async () => {
  await sequelize.sync()

  await createDefaultStorageProvider()
  const storageProvider = getStorageProvider()

  const ClientSettings = sequelize.define('clientSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shortTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    startPath: {
      type: DataTypes.STRING,
      allowNull: false
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
    },
    appBackground: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appSubtitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    appSocialLinks: {
      type: DataTypes.JSON,
      allowNull: true
    },
    themeSettings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    themeModes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    key8thWall: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })

  const [clientSettings] = await ClientSettings.findAll()

  const manifestPath = path.join(appRootPath.path, 'packages/client/public/site.webmanifest')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf-8' }))

  const icon192px = /https:\/\//.test(clientSettings.icon192px)
    ? clientSettings.icon192px
    : path.join('client', clientSettings.icon192px)
  const icon512px = /https:\/\//.test(clientSettings.icon512px)
    ? clientSettings.icon512px
    : path.join('client', clientSettings.icon512px)
  manifest.name = clientSettings.title
  manifest.short_name = clientSettings.shortTitle
  manifest.start_url =
    config.client.url[config.client.url.length - 1] === '/' && clientSettings.startPath[0] === '/'
      ? config.client.url + clientSettings.startPath.slice(1)
      : config.client.url[config.client.url.length - 1] !== '/' && clientSettings.startPath[0] !== '/'
      ? config.client.url + '/' + clientSettings.startPath
      : config.client.url + clientSettings.startPath
  const cacheDomain = getCacheDomain(storageProvider)
  manifest.icons = [
    {
      src: /https:\/\//.test(icon192px)
        ? icon192px
        : cacheDomain[cacheDomain.length - 1] === '/' && icon192px[0] === '/'
        ? `https://${cacheDomain}${icon192px.slice(1)}`
        : cacheDomain[cacheDomain.length - 1] !== '/' && icon192px[0] !== '/'
        ? `https://${cacheDomain}/${icon192px}`
        : `https://${cacheDomain}${icon192px}`,
      sizes: '192x192',
      type: getContentType(icon192px)
    },
    {
      src: /https:\/\//.test(icon512px)
        ? icon512px
        : cacheDomain[cacheDomain.length - 1] === '/' && icon512px[0] === '/'
        ? `https://${cacheDomain}${icon512px.slice(1)}`
        : cacheDomain[cacheDomain.length - 1] !== '/' && icon512px[0] !== '/'
        ? `https://${cacheDomain}/${icon512px}`
        : `https://${cacheDomain}${icon512px}`,
      sizes: '512x512',
      type: getContentType(icon512px)
    }
  ]
  fs.writeFileSync(manifestPath, Buffer.from(JSON.stringify(manifest)))

  process.exit(0)
})
