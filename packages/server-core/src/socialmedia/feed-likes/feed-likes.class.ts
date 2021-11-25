import { BadRequest } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { QueryTypes } from 'sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { getCreatorByUserId } from '../util/getCreator'

/**
 * A class for ARC Feed service
 */
export class FeedLikes extends Service {
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
   * @param params user id
   * @returns {@Array} of found users
   */

  async find(params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    if (!loggedInUser?.userId) {
      return Promise.reject(new BadRequest("Could not get fired users list. Users isn't logged in! "))
    }
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100

    const { feed_likes: feedLikesModel, creator: creatorModel } = this.app.get('sequelizeClient').models

    const feed_likes_users = await feedLikesModel.findAndCountAll({
      where: {
        feedId: params.query?.feedId
      },
      offset: skip,
      limit,
      include: [{ model: creatorModel, as: 'creator' }],
      order: [['createdAt', 'DESC']] // order not used in find?
    })

    const data = feed_likes_users.rows.map((like) => {
      const creator = like.creator.dataValues
      return {
        // TODO: get creator from corresponding table
        id: creator.id,
        avatar: creator.avatar,
        name: creator.name,
        username: creator.username,
        verified: !!+creator.verified
      }
    })
    const feedsResult = {
      data,
      skip: skip,
      limit: limit,
      total: feed_likes_users.count
    }

    return feedsResult
  }

  async create(data: any, params: Params): Promise<any> {
    const { feed_likes: feedLikesModel } = this.app.get('sequelizeClient').models
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const transaction = await this.app.get('sequelizeClient').transaction()

    try {
      const newLike = await feedLikesModel.create({ feedId: data.feedId, creatorId })
      const dataQuery = `DELETE FROM  \`feed_fires\` WHERE feedId=:feedId AND creatorId=:creatorId`
      await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.DELETE,
        raw: true,
        replacements: {
          feedId: data.feedId,
          creatorId
        }
      })
      await transaction.commit()
      return newLike
    } catch (error) {
      await transaction.rollback()
      return null
    }
  }

  async remove(feedId: string, params: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const dataQuery = `DELETE FROM  \`feed_likes\` WHERE feedId=:feedId AND creatorId=:creatorId`
    await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: {
        feedId: feedId,
        creatorId
      }
    })
    return feedId
  }
}
