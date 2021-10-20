import { Params } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { QueryTypes } from 'sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { getCreatorByUserId } from '../util/getCreator'

/**
 * A class for Feed-bookmark service
 */
export class BlockCreator extends Service {
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
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const queryParamsReplacements = {
      skip,
      limit,
      creatorId
    } as any

    if (action === 'blocked') {
      const dataQuery = `SELECT creator.*, sr.url as avatar
      FROM \`block_creator\` as bc
      JOIN \`creator\` as creator ON creator.id=bc.blockedId
      LEFT JOIN \`static_resource\` as sr ON sr.id=creator.avatarId
      WHERE bc.creatorId=:creatorId
      ORDER BY bc.createdAt DESC    
      LIMIT :skip, :limit`

      const list = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
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
    const { block_creator: blockCreator } = this.app.get('sequelizeClient').models
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const newRecord = await blockCreator.create({ creatorId: creatorId, blockedId: data.creatorId })
    return newRecord
  }
  async remove(data: any, params?: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const dataQuery = `DELETE FROM block_creator WHERE creatorId = '${creatorId}' AND blockedId = '${data.blokedCreatorId}'`
    await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: {
        creatorId,
        blokedCreatorId: data.blokedCreatorId
      }
    })

    return creatorId
  }
}
