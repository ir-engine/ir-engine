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

/**
 * Type representing client settings that have been migrated to engine settings
 *
 * This type provides strongly-typed access to client settings stored in the engine-setting table
 * with category 'client'. It follows the structure defined in EngineSettings.Client.
 *
 * Note: key8thWall, themeModes, and themeSettings are excluded from migration
 * as per requirements.
 */
export type ClientEngineSettingType = {
  // Basic settings
  logo: string
  title: string
  shortTitle: string
  startPath: string
  url: string
  releaseName: string
  siteDescription: string

  // Icons and favicons
  appleTouchIcon: string
  favicon32px: string
  favicon16px: string
  icon192px: string
  icon512px: string
  siteManifest: string
  safariPinnedTab: string
  favicon: string
  webmanifestLink: string
  swScriptLink: string

  // App appearance
  appBackground: string
  appTitle: string
  appSubtitle: string
  appDescription: string

  // Google Tag Manager
  gtmContainerId: string
  gtmAuth?: string
  gtmPreview?: string

  // Social and legal
  appSocialLinks: Array<any>
  privacyPolicy: string
  termsOfService: string
  assistanceLink: string

  // Homepage settings
  homepageLinkButtonEnabled: boolean
  homepageLinkButtonRedirect: string
  homepageLinkButtonText: string

  // Media settings
  mediaSettings: {
    audio: {
      maxBitrate: number
    }
    video: {
      codec: string
      maxResolution: string
      lowResMaxBitrate: number
      midResMaxBitrate: number
      highResMaxBitrate: number
    }
    screenshare: {
      codec: string
      maxResolution: string
      lowResMaxBitrate: number
      midResMaxBitrate: number
      highResMaxBitrate: number
    }
  }
}
