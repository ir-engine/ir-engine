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

import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { defaultMediaSettings } from '@ir-engine/common/src/constants/DefaultMediaSettings'
import { defaultThemeModes, defaultThemeSettings } from '@ir-engine/common/src/constants/DefaultThemeSettings'
import {
  ClientSettingDatabaseType,
  clientSettingPath
} from '@ir-engine/common/src/schemas/setting/client-setting.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import appConfig from '@ir-engine/server-core/src/appconfig'

export const clientSettingSeedData = {
  logo: process.env.APP_LOGO || '',
  title: process.env.APP_TITLE || '',
  shortTitle: process.env.APP_TITLE || '',
  startPath: '/',
  releaseName: process.env.RELEASE_NAME || 'local',
  siteDescription: process.env.SITE_DESC || 'IR Engine',
  url:
    process.env.APP_URL ||
    (process.env.VITE_LOCAL_BUILD
      ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
      : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
  appleTouchIcon: 'apple-touch-icon.png',
  favicon32px: '/favicon-32x32.png',
  favicon16px: '/favicon-16x16.png',
  icon192px: '/android-chrome-192x192.png',
  icon512px: '/android-chrome-512x512.png',
  siteManifest: '/site.webmanifest',
  safariPinnedTab: '/safari-pinned-tab.svg',
  favicon: '/favicon.ico',
  appBackground: 'static/main-background.png',
  appTitle: 'static/ir-logo.svg',
  appSubtitle: 'IR Engine',
  appDescription: 'FREE, OPEN, & INTEROPERABLE IMMERSIVE WEB TECHNOLOGY',
  gaMeasurementId: '',
  appSocialLinks: JSON.stringify([
    { icon: 'static/discord.svg', link: 'https://discord.gg/xrf' },
    { icon: 'static/github.svg', link: 'https://github.com/ir-engine' }
  ]),
  themeSettings: JSON.stringify(defaultThemeSettings),
  themeModes: JSON.stringify(defaultThemeModes),
  key8thWall: process.env.VITE_8TH_WALL || '',
  privacyPolicy: 'https://www.ir.world/privacy-policy',
  homepageLinkButtonEnabled: false,
  homepageLinkButtonRedirect: '',
  homepageLinkButtonText: '',
  webmanifestLink: '',
  swScriptLink: '',
  mediaSettings: defaultMediaSettings
}

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ClientSettingDatabaseType[] = await Promise.all(
    [clientSettingSeedData].map(async (item) => ({
      ...item,
      id: uuidv4(),
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
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
