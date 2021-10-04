import { Params, ServiceAddons } from '@feathersjs/feathers'
import hooks from './reality-pack.hooks'
import { Application } from '../../../declarations'
import { RealityPack } from './reality-pack.class'
import createModel from './reality-pack.model'
import realityPackDocs from './reality-pack.docs'
import { getAxiosConfig, populateRealityPack } from '../content-pack/content-pack-helper'
import axios from 'axios'
import { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'
import fs from 'fs'
import path from 'path'
import { isDev } from '@xrengine/common/src/utils/isDev'

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

export const getDownloadedRealityPacks = (app: any) => {
  return async (params: Params) => {
    const packs = fs
      .readdirSync(path.resolve(__dirname, '../../../../realitypacks/packs/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .map((dir) => {
        try {
          const json: RealityPackInterface = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, '../../../../realitypacks/packs/' + dir + '/manifest.json'), 'utf8')
          )
          json.name = dir
          return json
        } catch (e) {
          console.warn('[getRealityPacks]: Failed to read manifest.json for reality pack', dir, 'with error', e)
          return
        }
      })
      .filter((val) => val !== undefined)
    return {
      data: packs
    }
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
  app.use('/reality-pack-list', {
    find: isDev ? getDownloadedRealityPacks(app) : event.find
  })

  const service = app.service('reality-pack')

  service.hooks(hooks as any)
}
