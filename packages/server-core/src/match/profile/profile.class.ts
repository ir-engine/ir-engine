import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'
import { Application } from '@xrengine/server-core/declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'

export class Profile extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: Params): Promise<any> {
    let select = `SELECT profile.* , sr.url as avatar ,team.id as tid`
    let from = ` FROM \`profile\` as profile 
       LEFT JOIN \`static_resource\` as sr ON sr.id=profile.avatarId 
       LEFT JOIN \`team\` as team ON team.profileId=profile.id`
    const where = ` WHERE profile.userId=:id`
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
    const loggedInUser = extractLoggedInUserFromParams(params)
    const profileQuery = `SELECT profile.*, sr.url as avatar 
           FROM \`profile\` as profile
           LEFT JOIN \`static_resource\` as sr ON sr.id=profile.avatarId
           WHERE profile.userId=:userId`
    let [profile] = await this.app.get('sequelizeClient').query(profileQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { userId: loggedInUser.userId }
    })
    const profileId = profile ? profile.id : null

    if (!profileId) {
      const { profile: profileModel } = this.app.get('sequelizeClient').models
      data.userId = loggedInUser.userId
      profile = await profileModel.create(data)
    }
    return profile
  }

  async patch(id: string, data?: any, params?: Params): Promise<any> {
    await super.patch(id, data)
    return await this.get(id)
  }
}
