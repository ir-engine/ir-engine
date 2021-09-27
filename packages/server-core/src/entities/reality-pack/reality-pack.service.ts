import { Params, ServiceAddons } from '@feathersjs/feathers'
import hooks from './reality-pack.hooks'
import { Application } from '../../../declarations'
import { RealityPack } from './reality-pack.class'
import createModel from './reality-pack.model'
import realityPackDocs from './reality-pack.docs'
import { getAxiosConfig, populateRealityPack } from '../content-pack/content-pack-helper'
import axios from 'axios'
import { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'

declare module '../../../declarations' {
  interface ServiceTypes {
    'reality-pack': RealityPack & ServiceAddons<any>
  }
}

export const addRealityPack = (app: any): any => {
  return async (data: { uploadURL: string }, params: Params) => {
    try {
      const manifestData = await axios.get(data.uploadURL, getAxiosConfig())
      const manifest = JSON.parse(manifestData.data.toString()) as RealityPackInterface
      await populateRealityPack({ name: manifest.name, manifest: data.uploadURL }, app, params)
    } catch (error) {
      console.log(error)
      return false
    }
    return true
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
  app.use('/upload-reality-pack', {
    create: addRealityPack(app)
  })

  const service = app.service('reality-pack')

  service.hooks(hooks as any)
}
