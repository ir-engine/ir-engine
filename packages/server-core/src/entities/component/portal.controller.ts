import express from 'express'

export const getAllPortals = (app: any): any => {
  return async (req: express.Request, res: express.Response) => {
    const models = app.get('sequelizeClient').models
    const portals = await models.component.findAll({
      where: {
        type: 'portal'
      },
      attributes: ['entityId'],
      include: [
        {
          model: models.entity,
          attributes: ['collectionId', 'name', 'entityId'],
          as: 'entity',
          include: [
            {
              model: models.collection,
              attributes: ['id', 'sid', 'name']
            }
          ]
        }
      ]
    })

    res.json(portals)
  }
}

export const getPortal = (app: any): any => {
  return async (req: express.Request, res: express.Response) => {
    const portals = await getPortalByEntityId(app, req.params.entityId)

    res.json(portals)
  }
}

export const getPortalByEntityId = async (app, entityId: string) => {
  const models = app.get('sequelizeClient').models

  return models.component.findOne({
    where: {
      type: 'portal',
      '$entity.entityId$': entityId
    },
    attributes: ['entityId', 'data'],
    include: [
      {
        model: models.entity,
        attributes: ['collectionId', 'name', 'entityId'],
        as: 'entity',
        include: [
          {
            model: models.collection,
            attributes: ['id', 'sid']
          }
        ]
      }
    ]
  })
}

export const getReflectionProbe = (app: any): any => {
  return async (req: express.Request, res: express.Response) => {
    const reflectionProbe = await getReflectionProbeById(app, req.params.entityId)

    res.json(reflectionProbe)
  }
}

export const getReflectionProbeById = async (app, entityId: string) => {
  const models = app.get('sequelizeClient').models

  return models.component.findOne({
    where: {
      type: 'reflectionprobe',
      '$entity.entityId$': entityId
    },
    include: [
      {
        model: models.entity,
        attributes: ['collectionId', 'name', 'entityId'],
        as: 'entity'
      }
    ]
  })
}
