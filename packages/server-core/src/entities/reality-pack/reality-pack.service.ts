import { Params } from '@feathersjs/feathers'
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
    'reality-pack': RealityPack
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

export const getInstalledRealityPacks = (realityPackClass: RealityPack) => {
  if (isDev) {
    return async (params: Params) => {
      const packs = fs
        .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .map((dir) => {
          try {
            const json: RealityPackInterface = JSON.parse(
              fs.readFileSync(
                path.resolve(__dirname, '../../../../projects/projects/' + dir + '/manifest.json'),
                'utf8'
              )
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
  } else {
    return async (params: Params) => {
      const packs = (await realityPackClass.find()) as any
      const manifests = []
      for (const data of packs.data) {
        const manifestData = await axios.get(data.storageProviderManifest, getAxiosConfig())
        manifests.push(JSON.parse(manifestData.data.toString()) as RealityPackInterface)
      }
      return {
        data: manifests
      }
    }
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const realityPackClass = new RealityPack(options, app)
  realityPackClass.docs = realityPackDocs

  app.use('reality-pack', realityPackClass)
  app.use('upload-reality-pack', {
    create: addRealityPack(app)
  })
  app.use('reality-pack-data', {
    find: getInstalledRealityPacks(realityPackClass)
  })

  const service = app.service('reality-pack')

  service.hooks(hooks)
}
