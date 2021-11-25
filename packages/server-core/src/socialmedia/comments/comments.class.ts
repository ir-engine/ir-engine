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
 * A class for ARC Feed Comment service
 */
export class Comments extends Service {
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
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100
    const feedId = params.query?.feedId

    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    let select = ` SELECT comments.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, 
      creator.verified as creatorVerified,  sr.url as avatar, COUNT(cf.id) as fires `
    const from = ` FROM \`comments\` as comments`
    let join = ` JOIN \`creator\` as creator ON creator.id=comments.creatorId
                    LEFT JOIN \`comments_fires\` as cf ON cf.commentId=comments.id 
                    LEFT JOIN \`static_resource\` as sr ON sr.id=creator.avatarId `
    const where = ` WHERE comments.feedId=:feedId `
    const order = ` GROUP BY comments.id
      ORDER BY comments.createdAt DESC    
      LIMIT :skip, :limit`
    const queryParamsReplacements = {
      feedId,
      skip,
      limit
    } as any

    if (creatorId) {
      select += ` , iscf.id as fired `
      join += ` LEFT JOIN \`comments_fires\` as iscf ON iscf.commentId=comments.id  AND iscf.creatorId=:creatorId`
      queryParamsReplacements.creatorId = creatorId
    }
    const dataQuery = select + from + join + where + order
    const feed_comments = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })

    const data = feed_comments.map((comment) => {
      return {
        creator: {
          id: comment.creatorId,
          avatar: comment.avatar,
          name: comment.creatorName,
          username: comment.creatorUserName,
          verified: !!+comment.creatorVerified
        },
        id: comment.id,
        feedId: comment.feedId,
        text: comment.text,
        fires: comment.fires,
        isFired: comment.fired ? true : false
      }
    })
    const feedsResult = {
      data,
      skip: skip,
      limit: limit,
      total: feed_comments.count
    }
    return feedsResult
  }

  async create(data: any, params: Params): Promise<any> {
    const { comments: commentsModel, creator: creatorModel } = this.app.get('sequelizeClient').models

    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const newComment = await commentsModel.create({ feedId: data.feedId, creatorId, text: data.text })
    const commentFromDb = await commentsModel.findOne({
      where: {
        id: newComment.id
      },
      include: [{ model: creatorModel, as: 'creator' }]
    })

    return {
      creator: {
        id: commentFromDb.creator.dataValues.id,
        avatar: commentFromDb.creator.dataValues.avatar,
        name: commentFromDb.creator.dataValues.name,
        username: commentFromDb.creator.dataValues.username,
        verified: !!+commentFromDb.creator.dataValues.verified
      },
      id: commentFromDb.id,
      feedId: commentFromDb.feedId,
      text: commentFromDb.text,
      fires: 0,
      isFired: false
    }
  }
}
