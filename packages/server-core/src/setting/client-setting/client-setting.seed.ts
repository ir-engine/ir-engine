import { Knex } from 'knex'
import { v4 } from 'uuid'

import { defaultThemeModes, defaultThemeSettings } from '@etherealengine/common/src/constants/DefaultThemeSettings'
import { clientSettingPath } from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        logo: process.env.APP_LOGO,
        title: process.env.APP_TITLE,
        shortTitle: process.env.APP_TITLE,
        startPath: '/',
        releaseName: process.env.RELEASE_NAME || 'local',
        siteDescription: process.env.SITE_DESC || 'Ethereal Engine',
        url:
          process.env.APP_URL ||
          (process.env.VITE_LOCAL_BUILD
            ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
            : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
        favicon32px: '/favicon-32x32.png',
        favicon16px: '/favicon-16x16.png',
        icon192px: '/android-chrome-192x192.png',
        icon512px: '/android-chrome-512x512.png',
        appBackground: 'static/main-background.png',
        appTitle: 'static/ethereal_mark.png',
        appSubtitle: 'EtherealEngine.org',
        appDescription: 'FREE, OPEN, & INTEROPERABLE IMMERSIVE WEB TECHNOLOGY',
        appSocialLinks: JSON.stringify([
          { icon: 'static/discord.svg', link: 'https://discord.gg/xrf' },
          { icon: 'static/github.svg', link: 'https://github.com/etherealengine' }
        ]),
        themeSettings: JSON.stringify(defaultThemeSettings),
        themeModes: JSON.stringify(defaultThemeModes),
        key8thWall: process.env.VITE_8TH_WALL,
        homepageLinkButtonEnabled: false,
        homepageLinkButtonRedirect: '',
        homepageLinkButtonText: ''
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(clientSettingPath).del()

    // Inserts seed entries
    await knex(clientSettingPath).insert(seedData)
  } else {
    const existingData = await knex(clientSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(clientSettingPath).insert(item)
      }
    }
  }
}
