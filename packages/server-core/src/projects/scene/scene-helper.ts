import koa from '@feathersjs/koa'
import appRootPath from 'app-root-path'
import path from 'path'

import config from '@etherealengine/common/src/config'
import { PortalDetail } from '@etherealengine/common/src/interfaces/PortalInterface'
import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { AssetClass } from '@etherealengine/engine/src/assets/enum/AssetClass'

import { Application } from '../../../declarations'
import { addAudioAssetFromProject } from '../../media/audio/audio-upload.helper'
import { addImageAssetFromProject } from '../../media/image/image-upload.helper'
import { addVideoAssetFromProject } from '../../media/video/video-upload.helper'
import { addVolumetricAssetFromProject } from '../../media/volumetric/volumetric-upload.helper'
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

export const convertStaticResource = async (app: Application, project: string, sceneData: SceneJson) => {
  const cacheRe = new RegExp(`${config.client.fileServer}\/projects`)
  const symbolRe = /__\$project\$__/
  const pathSymbol = '__$project$__'
  for (const [, entity] of Object.entries(sceneData!.entities)) {
    for (const component of entity.components) {
      let urls = [] as string[]
      const paths = component.props.paths
      switch (component.name) {
        case 'media':
          let mediaType
          if (paths && paths.length > 0) {
            urls = paths
            delete component.props.paths
            mediaType = AssetLoader.getAssetClass(urls[0])
          }
          for (let index in urls)
            if (symbolRe.test(urls[index]))
              urls[index] = urls[index].replace(pathSymbol, path.join(appRootPath.path, '/packages/projects/projects'))
          console.log('urls', urls)
          // console.log('urls', urls)
          if (mediaType === AssetClass.Audio)
            component.props.resources = JSON.parse(
              JSON.stringify(await Promise.all(urls.map((url) => addAudioAssetFromProject(app, [url], project))))
            )
          else if (mediaType === AssetClass.Video)
            component.props.resources = JSON.parse(
              JSON.stringify(await Promise.all(urls.map((url) => addVideoAssetFromProject(app, [url], project))))
            )
          else if (mediaType === AssetClass.Volumetric)
            component.props.resources = JSON.parse(
              JSON.stringify(await Promise.all(urls.map((url) => addVolumetricAssetFromProject(app, [url], project))))
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
              JSON.stringify(await Promise.all(urls.map((url) => addImageAssetFromProject(app, [url], project))))
            )
          break
      }
    }
  }
  return sceneData
}
