import { Service, SequelizeServiceOptions } from 'feathers-sequelize'

import { Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'
import { Application } from '@xrengine/server-core/declarations'
import { extractLoggedInUserFromParams } from '@xrengine/server-core/src/user/auth-management/auth-management.utils'

export class Preset extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const action = params.query?.action
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100
    const teamId = params.query?.teamId

    const queryParamsReplacements = {
      skip,
      limit,
      teamId
    } as any

    const dataQuery = `
    SELECT preset.*
    FROM preset
    WHERE preset.teamId=:teamId`

    const presets = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { ...queryParamsReplacements }
    })
    return presets
  }

  async get(id: Id, params?: Params): Promise<any> {
    let select = `SELECT preset.*`
    let from = ` FROM \`preset\` as preset`
    const where = ` WHERE preset.id=:id`

    const queryParamsReplacements = { id } as any

    const dataQuery = select + from + where
    const [preset] = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })
    return { ...preset }
  }

  async create(data: any, params?: Params): Promise<any> {
    const action = params.query?.action
    console.log('PARAMS', action)
    const loggedInUser = extractLoggedInUserFromParams(params)
    const presetQuery = `SELECT preset.* 
           FROM \`preset\` as preset
           WHERE preset.teamId=:teamId`
    let [preset] = await this.app.get('sequelizeClient').query(presetQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { teamId: data.teamId }
    })
    const presetName = preset ? preset.presetName : null

    if (action === 'default') {
      if (!presetName) {
        const { preset: presetModel } = this.app.get('sequelizeClient').models
        preset = await presetModel.create(data)
      }
    } else {
      const { preset: presetModel } = this.app.get('sequelizeClient').models
      preset = await presetModel.create(data)
    }
    return preset
  }

  async patch(id: string, data?: any, params?: Params): Promise<any> {
    await super.patch(id, data)
    return await this.get(id)
  }
}
