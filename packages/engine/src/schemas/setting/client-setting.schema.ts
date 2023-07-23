/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { querySyntax, Type } from '@feathersjs/typebox'

export const clientSettingPath = 'client-setting'

export const clientSettingMethods = ['find', 'get', 'patch'] as const

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

// Schema for creating new entries
export const clientSettingDataSchema = Type.Pick(
  clientSettingSchema,
  [
    'logo',
    'title',
    'shortTitle',
    'startPath',
    'url',
    'releaseName',
    'siteDescription',
    'favicon32px',
    'favicon16px',
    'icon192px',
    'icon512px',
    'webmanifestLink',
    'swScriptLink',
    'appBackground',
    'appTitle',
    'appSubtitle',
    'appDescription',
    'appSocialLinks',
    'themeSettings',
    'themeModes',
    'key8thWall',
    'homepageLinkButtonEnabled',
    'homepageLinkButtonRedirect',
    'homepageLinkButtonText'
  ],
  {
    $id: 'ClientSettingData'
  }
)
export type ClientSettingData = Static<typeof clientSettingDataSchema>

// Schema for updating existing entries
export const clientSettingPatchSchema = Type.Partial(clientSettingSchema, {
  $id: 'ClientSettingPatch'
})
export type ClientSettingPatch = Static<typeof clientSettingPatchSchema>

// Schema for allowed query properties
export const clientSettingQueryProperties = Type.Pick(clientSettingSchema, [
  'id',
  'logo',
  'title',
  'shortTitle',
  'startPath',
  'url',
  'releaseName',
  'siteDescription',
  'favicon32px',
  'favicon16px',
  'icon192px',
  'icon512px',
  'webmanifestLink',
  'swScriptLink',
  'appBackground',
  'appTitle',
  'appSubtitle',
  'appDescription',
  // 'appSocialLinks', Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
  // 'themeSettings',
  // 'themeModes',
  'key8thWall',
  'homepageLinkButtonEnabled',
  'homepageLinkButtonRedirect',
  'homepageLinkButtonText'
])
export const clientSettingQuerySchema = Type.Intersect(
  [
    querySyntax(clientSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ClientSettingQuery = Static<typeof clientSettingQuerySchema>
