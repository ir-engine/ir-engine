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
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../validators'

export const middlewareSettingPath = 'middleware-setting'

export const middlewareSettingMethods = ['find', 'get', 'patch'] as const

export const middlewareSocialLinkSchema = Type.Object(
  {
    link: Type.String(),
    icon: Type.String()
  },
  { $id: 'MiddlewareSocialLink', additionalProperties: false }
)
export interface MiddlewareSocialLinkType extends Static<typeof middlewareSocialLinkSchema> {}

// export const audioSettingsSchema = Type.Object(
//   {
//     maxBitrate: Type.Number()
//   },
//   { $id: 'AudioSettingsSchema', additionalProperties: false }
// )
//
// export interface AudioSettingsType extends Static<typeof audioSettingsSchema> {}
//
// export const videoSettingsSchema = Type.Object(
//   {
//     codec: Type.String(),
//     maxResolution: Type.String(),
//     lowResMaxBitrate: Type.Number(),
//     midResMaxBitrate: Type.Number(),
//     highResMaxBitrate: Type.Number()
//   },
//   { $id: 'VideoSettingsSchema', additionalProperties: false }
// )
//
// export const screenshareSettingsSchema = Type.Object(
//   {
//     codec: Type.String(),
//     lowResMaxBitrate: Type.Number(),
//     midResMaxBitrate: Type.Number(),
//     highResMaxBitrate: Type.Number()
//   },
//   { $id: 'ScreenshareSettingsSchema', additionalProperties: false }
// )
//
// export interface VideoSettingsType extends Static<typeof videoSettingsSchema> {}
//
// export const mediaSettingsSchema = Type.Object(
//   {
//     audio: Type.Ref(audioSettingsSchema),
//     video: Type.Ref(videoSettingsSchema),
//     screenshare: Type.Ref(screenshareSettingsSchema)
//   },
//   { $id: 'MediaSettingsSchema', additionalProperties: false }
// )

// export interface MediaSettingsType extends Static<typeof mediaSettingsSchema> {}

export const middlewareThemeOptionsSchema = Type.Object(
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
  { $id: 'MiddlewareThemeOptions', additionalProperties: false }
)
export interface MiddlewareThemeOptionsType extends Static<typeof middlewareThemeOptionsSchema> {}

// Main data model schema
export const middlewareSettingSchema = Type.Object(
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
    appSocialLinks: Type.Array(Type.Ref(middlewareSocialLinkSchema)),
    themeSettings: Type.Record(Type.String(), Type.Ref(middlewareThemeOptionsSchema)),
    themeModes: Type.Record(Type.String(), Type.String()),
    key8thWall: Type.String(),
    homepageLinkButtonEnabled: Type.Boolean(),
    homepageLinkButtonRedirect: Type.String(),
    homepageLinkButtonText: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
    // mediaSettings: Type.Ref(mediaSettingsSchema)
  },
  { $id: 'MiddlewareSetting', additionalProperties: false }
)
export interface MiddlewareSettingType extends Static<typeof middlewareSettingSchema> {}

export interface MiddlewareSettingDatabaseType
  extends Omit<MiddlewareSettingType, 'appSocialLinks' | 'themeSettings' | 'themeModes'> {
  appSocialLinks: string
  themeSettings: string
  themeModes: string
}

// Schema for creating new entries
export const middlewareSettingDataSchema = Type.Pick(
  middlewareSettingSchema,
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
    // 'mediaSettings'
  ],
  {
    $id: 'MiddlewareSettingData'
  }
)
export interface MiddlewareSettingData extends Static<typeof middlewareSettingDataSchema> {}

// Schema for updating existing entries
export const middlewareSettingPatchSchema = Type.Partial(middlewareSettingSchema, {
  $id: 'MiddlewareSettingPatch'
})
export interface MiddlewareSettingPatch extends Static<typeof middlewareSettingPatchSchema> {}

// Schema for allowed query properties
export const middlewareSettingQueryProperties = Type.Pick(middlewareSettingSchema, [
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
export const middlewareSettingQuerySchema = Type.Intersect(
  [
    querySyntax(middlewareSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MiddlewareSettingQuery extends Static<typeof middlewareSettingQuerySchema> {}

// export const audioSettingsValidator = /* @__PURE__ */ getValidator(audioSettingsSchema, dataValidator)
// export const videoSettingsValidator = /* @__PURE__ */ getValidator(videoSettingsSchema, dataValidator)
// export const screenshareSettingsValidator = /* @__PURE__ */ getValidator(screenshareSettingsSchema, dataValidator)
// export const mediaSettingsValidator = /* @__PURE__ */ getValidator(mediaSettingsSchema, dataValidator)
export const middlewareSocialLinkValidator = /* @__PURE__ */ getValidator(middlewareSocialLinkSchema, dataValidator)
export const middlewareThemeOptionsValidator = /* @__PURE__ */ getValidator(middlewareThemeOptionsSchema, dataValidator)
export const middlewareSettingValidator = /* @__PURE__ */ getValidator(middlewareSettingSchema, dataValidator)
export const middlewareSettingDataValidator = /* @__PURE__ */ getValidator(middlewareSettingDataSchema, dataValidator)
export const middlewareSettingPatchValidator = /* @__PURE__ */ getValidator(middlewareSettingPatchSchema, dataValidator)
export const middlewareSettingQueryValidator = /* @__PURE__ */ getValidator(
  middlewareSettingQuerySchema,
  queryValidator
)
