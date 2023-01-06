import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers/lib'
import path from 'path'

import { Location } from '@xrengine/common/src/interfaces/Location'
import { OEmbed } from '@xrengine/common/src/interfaces/OEmbed'
import { ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'
import { Application } from '@xrengine/server-core/declarations'
import { getStorageProvider } from '@xrengine/server-core/src/media/storageprovider/storageprovider'
import { installAvatarsFromProject } from '@xrengine/server-core/src/user/avatar/avatar-helper'

const avatarsFolder = path.resolve(__dirname, 'public/avatars')

const handleOEmbedRequest = async (app: Application, url: URL, currentOEmbed: OEmbed) => {
  const isLocation = /^\/location\//.test(url.pathname)
  const isAdminPanel = /^\/admin/.test(url.pathname)
  const isEditor = /^\/studio/.test(url.pathname)
  if (isLocation) {
    const locationName = url.pathname.replace(/\/location\//, '')
    const locationResult = (await app.service('location').find({
      query: {
        slugifiedName: locationName
      }
    })) as Paginated<Location>
    if (locationResult.total === 0) throw new BadRequest('Invalid location name')
    const [projectName, sceneName] = locationResult.data[0].sceneId.split('/')
    const storageProvider = getStorageProvider()
    currentOEmbed.title = `${locationResult.data[0].name} - ${currentOEmbed.title}`
    currentOEmbed.description = `Join others in VR at ${locationResult.data[0].name}, directly from the web browser`
    currentOEmbed.type = 'photo'
    currentOEmbed.url = `https://${storageProvider.cacheDomain}/projects/${projectName}/${sceneName}.thumbnail.jpeg`
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
      const locationResult = (await app.service('location').find({
        query: {
          sceneId: subPath
        }
      })) as Paginated<Location>
      if (locationResult.total > 0) {
        const [projectName, sceneName] = locationResult.data[0].sceneId.split('/')
        const storageProvider = getStorageProvider()
        currentOEmbed.title = `${locationResult.data[0].name} Studio - ${currentOEmbed.title}`
        currentOEmbed.type = 'photo'
        currentOEmbed.url = `https://${storageProvider.cacheDomain}/projects/${projectName}/${sceneName}.thumbnail.jpeg`
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
  onInstall: (app: Application) => {
    return installAvatarsFromProject(app, avatarsFolder)
  },
  onUpdate: (app: Application) => {
    return installAvatarsFromProject(app, avatarsFolder)
  },
  onOEmbedRequest: handleOEmbedRequest
  // TODO: remove avatars
  // onUninstall: (app: Application) => {
  // }
} as ProjectEventHooks

export default config
