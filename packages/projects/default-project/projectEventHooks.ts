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

import { BadRequest } from '@feathersjs/errors'
import fs from 'fs'
import path from 'path'

import {
  locationPath,
  LocationType,
  OembedType,
  ProjectType,
  staticResourcePath,
  StaticResourceType
} from '@ir-engine/common/src/schema.type.module'
import { createLocations } from '@ir-engine/projects/createLocations'
import { ProjectEventHooks } from '@ir-engine/projects/ProjectConfigInterface'
import { Application } from '@ir-engine/server-core/declarations'

import { patchStaticResourceAsAvatar, supportedAvatars } from '@ir-engine/server-core/src/user/avatar/avatar-helper'
import appRootPath from 'app-root-path'
import manifestJson from './manifest.json'

const projectRelativeFolder = path.resolve(appRootPath.path, 'packages/projects')
const avatarsFolder = path.resolve(__dirname, 'assets/avatars')

const handleOEmbedRequest = async (app: Application, project: ProjectType, url: URL, currentOEmbed: OembedType) => {
  const isLocation = /^\/location\//.test(url.pathname)
  const isAdminPanel = /^\/admin/.test(url.pathname)
  const isEditor = /^\/studio/.test(url.pathname)
  if (isLocation) {
    const locationName = url.pathname.replace(/\/location\//, '')
    const locationResult = (await app.service(locationPath).find({
      query: {
        slugifiedName: locationName
      },
      pagination: false
    } as any)) as any as LocationType[]
    if (locationResult.length === 0) throw new BadRequest('Invalid location name')
    const scene = (await app.service(staticResourcePath).get(locationResult[0].sceneId)) as StaticResourceType
    currentOEmbed.title = `${locationResult[0].name} - ${currentOEmbed.title}`
    currentOEmbed.description = `Join others in VR at ${locationResult[0].name}, directly from the web browser`
    currentOEmbed.type = 'photo'
    currentOEmbed.url = scene.thumbnailURL
    currentOEmbed.height = 320
    currentOEmbed.width = 512

    return currentOEmbed
  } else if (isAdminPanel) {
    currentOEmbed.title = `Admin Dashboard - ${currentOEmbed.title}`
    currentOEmbed.description = `Manage all aspects of your deployment. ${currentOEmbed.description}`

    return currentOEmbed
  } else if (isEditor) {
    currentOEmbed.title = `Studio - ${currentOEmbed.title}`
    currentOEmbed.description = `No need to download extra software. Create, publish, and edit your world directly in the web browser.`

    let subPath = url.pathname.replace(/\/studio\//, '')
    if (subPath.startsWith('studio')) {
      subPath = url.pathname.replace(/\/studio/, '')
    }

    if (subPath.includes('/')) {
      const locationResult = (await app.service(locationPath).find({
        query: {
          sceneId: subPath
        },
        pagination: false
      } as any)) as any as LocationType[]
      if (locationResult.length > 0) {
        const scene = (await app.service(staticResourcePath).get(locationResult[0].sceneId)) as StaticResourceType
        currentOEmbed.title = `${locationResult[0].name} Studio - ${currentOEmbed.title}`
        currentOEmbed.type = 'photo'
        currentOEmbed.url = scene.thumbnailURL
        currentOEmbed.height = 320
        currentOEmbed.width = 512
        return currentOEmbed
      }
    } else if (subPath.length > 0) {
      currentOEmbed.title = `${subPath} Editor - ${currentOEmbed.title}`
      return currentOEmbed
    }

    return null
  }
}

const config = {
  onInstall: async (app: Application) => {
    await createLocations(app, manifestJson.name, {
      apartment: 'public/scenes/apartment.gltf',
      default: 'public/scenes/default.gltf',
      ['sky-station']: 'public/scenes/sky-station.gltf'
    })
    await Promise.all(
      fs
        .readdirSync(avatarsFolder)
        .filter((file) => supportedAvatars.includes(file.split('.').pop()!))
        .map((file) =>
          patchStaticResourceAsAvatar(
            app,
            manifestJson.name,
            path.resolve(avatarsFolder, file).replace(projectRelativeFolder + '/', '')
          )
        )
    )
  },
  // onUpdate: (app: Application) => {
  //   return installAvatarsFromProject(app, avatarsFolder)
  // },
  onOEmbedRequest: handleOEmbedRequest
  // TODO: remove avatars
  // onUninstall: (app: Application) => {
  // }
} as ProjectEventHooks

export default config
