import { Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import knex from 'knex'

export const clientSettingPath = 'client-setting'

export const clientSocialLinkSchema = Type.Object(
  {
    link: Type.String(),
    icon: Type.String()
  },
  { $id: 'ClientSocialLink', additionalProperties: false }
)
export type ClientSocialLinkType = Static<typeof clientSocialLinkSchema>

export const clientThemeOptionsSchema = Type.Object(
  {
    textColor: Type.String(),
    navbarBackground: Type.String(),
    sidebarBackground: Type.String(),
    sidebarSelectedBackground: Type.String(),
    mainBackground: Type.String(),
    panelBackground: Type.String(),
    panelCards: Type.String(),
    panelCardHoverOutline: Type.String(),
    panelCardIcon: Type.String(),
    textHeading: Type.String(),
    textSubheading: Type.String(),
    textDescription: Type.String(),
    iconButtonColor: Type.String(),
    iconButtonHoverColor: Type.String(),
    iconButtonBackground: Type.String(),
    iconButtonSelectedBackground: Type.String(),
    buttonOutlined: Type.String(),
    buttonFilled: Type.String(),
    buttonGradientStart: Type.String(),
    buttonGradientEnd: Type.String(),
    buttonTextColor: Type.String(),
    scrollbarThumbXAxisStart: Type.String(),
    scrollbarThumbXAxisEnd: Type.String(),
    scrollbarThumbYAxisStart: Type.String(),
    scrollbarThumbYAxisEnd: Type.String(),
    scrollbarCorner: Type.String(),
    inputOutline: Type.String(),
    inputBackground: Type.String(),
    primaryHighlight: Type.String(),
    dropdownMenuBackground: Type.String(),
    dropdownMenuHoverBackground: Type.String(),
    dropdownMenuSelectedBackground: Type.String(),
    drawerBackground: Type.String(),
    popupBackground: Type.String(),
    tableHeaderBackground: Type.String(),
    tableCellBackground: Type.String(),
    tableFooterBackground: Type.String(),
    dockBackground: Type.String()
  },
  { $id: 'ClientThemeOptions', additionalProperties: false }
)
export type ClientThemeOptionsType = Static<typeof clientThemeOptionsSchema>

// Main data model schema
export const clientSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    logo: Type.String(),
    title: Type.String(),
    shortTitle: Type.String(),
    startPath: Type.String(),
    url: Type.String(),
    releaseName: Type.String(),
    siteDescription: Type.String(),
    appleTouchIcon: Type.String(),
    favicon32px: Type.String(),
    favicon16px: Type.String(),
    icon192px: Type.String(),
    icon512px: Type.String(),
    webmanifestLink: Type.String(),
    swScriptLink: Type.String(),
    appBackground: Type.String(),
    appTitle: Type.String(),
    appSubtitle: Type.String(),
    appDescription: Type.String(),
    appSocialLinks: Type.Array(Type.Ref(clientSocialLinkSchema)),
    themeSettings: Type.Record(Type.String(), Type.Ref(clientThemeOptionsSchema)),
    themeModes: Type.Record(Type.String(), Type.String()),
    key8thWall: Type.String(),
    homepageLinkButtonEnabled: Type.Boolean(),
    homepageLinkButtonRedirect: Type.String(),
    homepageLinkButtonText: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ClientSetting', additionalProperties: false }
)
export type ClientSettingType = Static<typeof clientSettingSchema>

export type ClientSettingDatabaseType = Omit<ClientSettingType, 'appSocialLinks' | 'themeSettings' | 'themeModes'> & {
  appSocialLinks: string
  themeSettings: string
  themeModes: string
}

export const clientDbToSchema = async (rawData: ClientSettingDatabaseType): Promise<ClientSettingType> => {
  let appSocialLinks = JSON.parse(rawData.appSocialLinks) as ClientSocialLinkType[]

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof appSocialLinks === 'string') {
    appSocialLinks = JSON.parse(appSocialLinks)
  }

  let themeSettings = JSON.parse(rawData.themeSettings) as Record<string, ClientThemeOptionsType>

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof themeSettings === 'string') {
    themeSettings = JSON.parse(themeSettings)
  }

  let themeModes = JSON.parse(rawData.themeModes) as Record<string, string>

  // Usually above JSON.parse should be enough. But since our pre-feathers 5 data
  // was serialized multiple times, therefore we need to parse it twice.
  if (typeof themeModes === 'string') {
    themeModes = JSON.parse(themeModes)
  }

  return {
    ...rawData,
    appSocialLinks,
    themeSettings,
    themeModes
  }
}

export const getClientSetting = async () => {
  const knexClient = knex({
    client: 'mysql',
    connection: {
      user: process.env.MYSQL_USER ?? 'server',
      password: process.env.MYSQL_PASSWORD ?? 'password',
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      database: process.env.MYSQL_DATABASE ?? 'etherealengine',
      charset: 'utf8mb4'
    }
  })

  const clientSetting = await knexClient
    .select()
    .from<ClientSettingDatabaseType>(clientSettingPath)
    .then(([dbClient]) => {
      const dbClientConfig = clientDbToSchema(dbClient) || {
        logo: './logo.svg',
        title: 'Ethereal Engine',
        url: 'https://local.etherealengine.org',
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
      console.warn('[vite.config]: Failed to read clientSetting')
      console.warn(e)
    })

  return clientSetting!
}
