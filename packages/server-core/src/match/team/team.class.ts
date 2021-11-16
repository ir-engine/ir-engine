import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application, Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'

export class Team extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: Params): Promise<any> {
    let select = `SELECT team.*`
    let from = ` FROM \`team\` as team`
    const where = ` WHERE team.profileId=:id`

    const queryParamsReplacements = { id } as any

    const dataQuery = select + from + where
    const [profile] = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })
    return { ...profile }
  }

  async create(data: any, params?: Params): Promise<any> {
    const teamQuery = `SELECT team.*
           FROM \`team\` as team
           WHERE team.profileId=:profileId`
    let [team] = await this.app.get('sequelizeClient').query(teamQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { profileId: data.profileId }
    })
    const teamId = team ? team.id : null

    if (!teamId) {
      const { team: teamModel } = this.app.get('sequelizeClient').models
      team = await teamModel.create(data)
    }
    return team
  }

  async patch(id: string, data?: any, params?: Params): Promise<any> {
    await super.patch(id, data)
    return await this.get(id)
  }
}
