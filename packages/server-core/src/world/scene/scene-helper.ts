import { Params } from '@feathersjs/feathers'
import express from 'express'
import { Application } from '../../../declarations'
import { parseScenePortals } from './scene-parser'

export const getAllPortals = (app: Application): any => {
  return async (params?: Params) => {
    params.metadataOnly = false
    const scenes = await (await app.service('scenes').find(params)).data
    return {
      data: scenes.map((scene) => parseScenePortals(scene)).flat()
    }
  }
}

export const getPortal = (app: any): any => {
  return async (req: express.Request, res: express.Response) => {
    const portals = await getPortalByEntityId(app, req.params.entityId)

    res.json(portals)
  }
}

export const getPortalByEntityId = async (app, entityId: string) => {
  // TODO: reimplement with new scene format
  // const models = app.get('sequelizeClient').models
  // return models.component.findOne({
  //   where: {
  //     type: 'portal',
  //     '$entity.entityId$': entityId
  //   },
  //   attributes: ['entityId', 'data'],
  //   include: [
  //     {
  //       model: models.entity,
  //       attributes: ['collectionId', 'name', 'entityId'],
  //       as: 'entity',
  //       include: [
  //         {
  //           model: models.collection,
  //           attributes: ['id', 'sid']
  //         }
  //       ]
  //     }
  //   ]
  // })
}

export const getCubemapBake = (app: any): any => {
  return async (req: express.Request, res: express.Response) => {
    const cubemapBake = await getCubemapBakeById(app, req.params.entityId)

    res.json(cubemapBake)
  }
}

export const getCubemapBakeById = async (app, entityId: string) => {
  // TODO: reimplement with new scene format
  // const models = app.get('sequelizeClient').models
  // return models.component.findOne({
  //   where: {
  //     type: 'cubemapbake',
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
