import { ServiceAddons } from '@feathersjs/feathers'
import hooks from './reality-pack.hooks'
import { Application } from '../../../declarations'
import { RealityPack } from './reality-pack.class'
import createModel from './reality-pack.model'
import realityPackDocs from './reality-pack.docs'
import { getAxiosConfig, populateRealityPack } from '../content-pack/content-pack-helper'
import axios from 'axios'
import express from 'express'
import { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'

declare module '../../../declarations' {
  interface ServiceTypes {
    'reality-pack': RealityPack & ServiceAddons<any>
  }
}

export const addRealityPack = (app: any): any => {
  return async (req: express.Request, res: express.Response) => {
    console.log(req, req.body)
    const data = req.body
    const manifestData = await axios.get(data.url, getAxiosConfig())
    const manifest = JSON.parse(manifestData.data.toString()) as RealityPackInterface
    await populateRealityPack({ name: manifest.name, manifest: data.url }, app, {})
    res.json({})
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new RealityPack(options, app)
  event.docs = realityPackDocs
  app.use('/reality-pack', event)
  app.get('/reality-pack/add', addRealityPack(app))

  const service = app.service('reality-pack')

  service.hooks(hooks as any)
}
