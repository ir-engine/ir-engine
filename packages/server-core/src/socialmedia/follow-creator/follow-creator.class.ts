/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Params } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { QueryTypes } from 'sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { getCreatorByUserId } from '../util/getCreator'

/**
 * A class for Feed-bookmark service
 */
export class FollowCreator extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * @function find it is used to find specific users
   *
   * @param params
   * @returns {@Array} of found users
   */

  async find(params: Params): Promise<any> {
    const action = params.query?.action
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100
    const creatorId = params.query?.creatorId

    const queryParamsReplacements = {
      skip,
      limit,
      creatorId
    } as any

    if (action === 'followers') {
      const dataQuery = `SELECT creator.*, sr.url as avatar
        FROM \`follow_creator\` as fc
        JOIN \`creator\` as creator ON creator.id=fc.followerId
        LEFT JOIN \`static_resource\` as sr ON sr.id=creator.avatarId
        WHERE fc.creatorId=:creatorId
        ORDER BY fc.createdAt DESC    
        LIMIT :skip, :limit`

      const list = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })

      return {
        data: list,
        skip,
        limit,
        total: list.count
      }
    }

    if (action === 'following') {
      const dataQuery = `SELECT creator.*, sr.url as avatar
        FROM \`follow_creator\` as fc
        JOIN \`creator\` as creator ON creator.id=fc.creatorId
        JOIN \`static_resource\` as sr ON sr.id=creator.avatarId
        WHERE fc.followerId=:creatorId
        ORDER BY fc.createdAt DESC    
        LIMIT :skip, :limit`

      const list = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })

      return {
        data: list,
        skip,
        limit,
        total: list.count
      }
    }
  }

  async create(data: any, params?: Params): Promise<any> {
    const { follow_creator: followCreator } = this.app.get('sequelizeClient').models
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const newRecord = await followCreator.create({ creatorId: data.creatorId, followerId: creatorId })
    return newRecord
  }

  async remove(followedCreatorId: string, params?: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const dataQuery = `DELETE FROM  \`follow_creator\` WHERE creatorId=:followedCreatorId AND followerId=:creatorId`
    await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: {
        creatorId,
        followedCreatorId
      }
    })
    return {
      followedCreatorId,
      creatorId
    }
  }
}
