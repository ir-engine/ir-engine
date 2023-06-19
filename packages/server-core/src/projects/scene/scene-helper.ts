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
import appRootPath from 'app-root-path'
import path from 'path'

import config from '@etherealengine/common/src/config'
import { PortalDetail } from '@etherealengine/common/src/interfaces/PortalInterface'
import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AssetClass } from '@etherealengine/engine/src/assets/enum/AssetClass'

import { Application } from '../../../declarations'
import { audioUpload } from '../../media/audio/audio-upload.helper'
import { imageUpload } from '../../media/image/image-upload.helper'
import { videoUpload } from '../../media/video/video-upload.helper'
import { volumetricUpload } from '../../media/volumetric/volumetric-upload.helper'
import { parseScenePortals } from './scene-parser'
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

export const convertStaticResource = async (app: Application, sceneData: SceneJson) => {
  const cacheRe = new RegExp(`${config.client.fileServer}\/projects`)
  const symbolRe = /__\$project\$__/
  const pathSymbol = '__$project$__'
  for (const [, entity] of Object.entries(sceneData!.entities)) {
    for (const component of entity.components) {
      let urls = [] as string[]
      const paths = component.props.paths
      const resources = component.props.resources
      switch (component.name) {
        case 'media':
          let mediaType
          if (paths && paths.length > 0) {
            urls = paths
            delete component.props.paths
            mediaType = AssetLoader.getAssetClass(urls[0])
          } else {
            for (const resource of resources ?? []) {
              if (resource.mp3StaticResource || resource.oggStaticResource || resource.mpegStaticResource) {
                mediaType = AssetClass.Audio
                urls.push(
                  typeof resource.mp3StaticResource === 'string'
                    ? resource.mp3StaticResource
                    : typeof resource.mp3StaticResource === 'object'
                    ? resource.mp3StaticResource.url
                    : typeof resource.oggStaticResource === 'string'
                    ? resource.oggStaticResource
                    : typeof resource.oggStaticResource === 'object'
                    ? resource.oggStaticResource.url
                    : typeof resource.mpegStaticResource === 'string'
                    ? resource.mpegStaticResource
                    : resource.mpegStaticResource.url
                )
              } else if (resource.mp4StaticResource || resource.m3u8StaticResource) {
                mediaType = AssetClass.Video
                urls.push(
                  typeof resource.mp4StaticResource === 'string'
                    ? resource.mp4StaticResource
                    : typeof resource.mp4StaticResource === 'object'
                    ? resource.mp4StaticResource.url
                    : typeof resource.m3u8StaticResource === 'string'
                    ? resource.m3u8StaticResource
                    : resource.m3u8StaticResource.url
                )
              } else if (resource.drcsStaticResource || resource.uvolStaticResource || resource.manifest) {
                mediaType = AssetClass.Volumetric
                urls.push(
                  typeof resource.manifest === 'object'
                    ? resource.manifest.staticResource.url
                    : typeof resource.drcsStaticResource === 'string'
                    ? resource.drcsStaticResource
                    : typeof resource.drcsStaticResource === 'object'
                    ? resource.drcsStaticResource.url
                    : typeof resource.uvolStaticResource === 'string'
                    ? resource.uvolStaticResource
                    : resource.uvolStaticResource.url
                )
              }
            }
          }
          for (let index in urls)
            if (symbolRe.test(urls[index]))
              urls[index] = urls[index].replace(pathSymbol, path.join(appRootPath.path, '/packages/projects/projects'))
          // console.log('urls', urls)
          if (mediaType === AssetClass.Audio)
            component.props.resources = JSON.parse(
              JSON.stringify(await Promise.all(urls.map((url) => audioUpload(app, { url: url }))))
            )
          else if (mediaType === AssetClass.Video)
            component.props.resources = JSON.parse(
              JSON.stringify(await Promise.all(urls.map((url) => videoUpload(app, { url: url }))))
            )
          else if (mediaType === AssetClass.Volumetric)
            component.props.resources = JSON.parse(
              JSON.stringify(await Promise.all(urls.map((url) => volumetricUpload(app, { url: url }))))
            )
          break
        // case 'model':
        //   await uploadModel(this.app, component, projectName)
        //   break
        // case 'animation':
        //   await uploadAnimation(this.app, component, projectName)
        //   break
        // case 'material':
        //   await uploadMaterial(this.app, component, projectName)
        //   break
        // case 'script':
        //   await uploadScript(this.app, component, projectName)
        //   break
        // case 'cubemap':
        //   await uploadCubemap(this.app, component, projectName)
        //   break
        case 'image':
          if (paths && paths.length > 0) {
            urls = paths
            delete component.props.paths
          } else
            component.props.resources = JSON.parse(
              JSON.stringify(await Promise.all(urls.map((url) => imageUpload(app, { url: url }))))
            )
          break
      }
    }
  }
  return sceneData
}
