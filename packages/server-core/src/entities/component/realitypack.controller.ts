import express from 'express'
import fs from 'fs'
import { RealityPack } from '@xrengine/common/src/interfaces/RealityPack'
import path from 'path'

export const getRealityPacks = (app: any): any => {
  return async (req: express.Request, res: express.Response) => {
    const realityPacks: RealityPack[] = fs
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
    res.json(realityPacks)
  }
}
