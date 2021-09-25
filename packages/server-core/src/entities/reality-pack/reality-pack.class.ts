import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import fs from 'fs'
import path from 'path'

interface Data {}

export const getCachedRealityPacks = () => {
  return fs
    .readdirSync(path.resolve(__dirname, '../../../../realitypacks/packs/'), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .map((dir) => {
      try {
        return JSON.parse(
          fs.readFileSync(path.resolve(__dirname, '../../../../realitypacks/packs/' + dir + '/manifest.json'), 'utf8')
        )
      } catch (e) {
        console.warn('[getRealityPacks]: Failed to read manifest.json for reality pack', dir, 'with error', e)
        return
      }
    })
    .filter((val) => val !== undefined)
}

export const cacheRealityPacks = () => {}

export class RealityPack extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
    console.log(getCachedRealityPacks())
  }
}
