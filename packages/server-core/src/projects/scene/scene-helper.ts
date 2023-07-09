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

import koa from '@feathersjs/koa'
import fs from 'fs'

import { PortalDetail } from '@etherealengine/common/src/interfaces/PortalInterface'
import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { addAssetFromProject } from '../../media/static-resource/static-resource-helper'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
// import { addVolumetricAssetFromProject } from '../../media/volumetric/volumetric-upload.helper'
import { cleanSceneDataCacheURLs, parseScenePortals } from './scene-parser'
import { SceneParams } from './scene.service'

const FILE_NAME_REGEX = /(\w+\.\w+)$/

export const getAllPortals = (app: Application) => {
  return async (params?: SceneParams) => {
    params!.metadataOnly = false
    const scenes = (await app.service('scene-data').find(params!)).data
    return {
      data: scenes.map((scene) => parseScenePortals(scene)).flat()
    }
  }
}

export const getPortal = (app: any) => {
  return async (id: string, params?: SceneParams) => {
    params!.metadataOnly = false
    const scenes = await (await app.service('scene-data').find(params!)).data
    const portals = scenes.map((scene) => parseScenePortals(scene)).flat() as PortalDetail[]
    return {
      data: portals.find((portal) => portal.portalEntityId === id)
    }
  }
}

export const getEnvMapBake = (app: any) => {
  return async (ctx: koa.FeathersKoaContext) => {
    const envMapBake = await getEnvMapBakeById(app, ctx.params.entityId)
    ctx.body = {
      status: 'success',
      json: envMapBake
    }
  }
}

export const getEnvMapBakeById = async (app, entityId: string) => {
  // TODO: reimplement with new scene format
  // const models = app.get('sequelizeClient').models
  // return models.component.findOne({
  //   where: {
  //     type: 'envmapbake',
  //     '$entity.entityId$': entityId
  //   },
  //   include: [
  //     {
  //       model: models.entity,
  //       attributes: ['collectionId', 'name', 'entityId'],
  //       as: 'entity'
  //     }
  //   ]
  // })
}

export const uploadSceneToStaticResources = async (
  app: Application,
  projectName: string,
  file: string,
  storageProviderName?: string
) => {
  const fileResult = fs.readFileSync(file)

  // todo - how do we handle updating projects on local dev?
  if (!config.kubernetes.enabled) return fileResult

  const storageProvider = getStorageProvider(storageProviderName)
  const cacheDomain = getCacheDomain(storageProvider, true)

  if (/.scene.json$/.test(file)) {
    const sceneData = JSON.parse(fileResult.toString())
    const convertedSceneData = await convertStaticResource(app, projectName, sceneData)
    cleanSceneDataCacheURLs(convertedSceneData, cacheDomain)
    const newFile = Buffer.from(JSON.stringify(convertedSceneData, null, 2))
    fs.writeFileSync(file, newFile)
    return newFile
  }

  return fileResult
}

export const convertStaticResource = async (app: Application, project: string, sceneData: SceneJson) => {
  // parallelizes each entity, serializes each component to avoid media playlists taking up gigs of memory when downloading
  await Promise.all(
    Object.values(sceneData!.entities).map(async (entity) => {
      try {
        for (const component of entity.components) {
          switch (component.name) {
            case 'media': {
              let urls = [] as string[]
              const paths = component.props.paths
              if (paths) {
                urls = paths
                delete component.props.paths
              }
              const resources = component.props.resources
              if (resources && resources.length > 0) {
                if (typeof resources[0] === 'string') urls = resources
                else urls = resources.map((resource) => resource.path)
              }

              const isVolumetric = entity.components.find((component) => component.name === 'volumetric')
              if (isVolumetric) {
                const extensions = ['drcs', 'mp4', 'manifest']
                const newUrls = [] as string[]
                for (const url of urls) {
                  const split = url.split('.')
                  const fileName = split.slice(0, split.length - 1).join('.')
                  for (const extension of extensions) {
                    newUrls.push(`${fileName}.${extension}`)
                  }
                }
                urls = newUrls
              }

              const newUrls = [] as string[]
              for (const url of urls) {
                const newURL = await addAssetFromProject(app, url, project)
                newUrls.push(newURL.url!)
              }
              if (isVolumetric) {
                component.props.resources = newUrls.filter((url) => url.endsWith('.mp4'))
              } else {
                component.props.resources = newUrls
              }
              break
            }
            case 'gltf-model': {
              if (component.props.src) {
                const resource = await addAssetFromProject(app, component.props.src, project)
                component.props.src = resource.url
              }
              break
            }
            case 'image': {
              if (component.props.source) {
                const resource = await addAssetFromProject(app, component.props.source, project)
                component.props.source = resource.url
              }
              break
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
  )
  return sceneData
}
