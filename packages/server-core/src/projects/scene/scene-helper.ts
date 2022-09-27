import express from 'express'

import { PortalDetail } from '@xrengine/common/src/interfaces/PortalInterface'

import { Application } from '../../../declarations'
import { parseScenePortals } from './scene-parser'
import { SceneParams } from './scene.service'

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
  return async (req: express.Request, res: express.Response) => {
    const envMapBake = await getEnvMapBakeById(app, req.params.entityId)

    res.json(envMapBake)
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
