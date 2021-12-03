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
 * A class for ARC Feed Comment fires service
 */
export class CommentsFire extends Service {
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
    const action = params.query?.action
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100
    const commentId = params.query?.commentId

    const queryParamsReplacements = {
      skip,
      limit,
      commentId
    } as any

    if (action === 'comment-fires') {
      const dataQuery = `SELECT creator.*, sr.url as avatar
        FROM \`comments_fires\` as cf
        JOIN \`creator\` as creator ON creator.id=cf.creatorId
        JOIN \`static_resource\` as sr ON sr.id=creator.avatarId
        WHERE cf.commentId=:commentId
        ORDER BY cf.createdAt DESC    
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

  async create(data: any, params: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const { comments_fires: commentFiresModel } = this.app.get('sequelizeClient').models
    const newFire = await commentFiresModel.create({ commentId: data.commentId, creatorId })
    return newFire
  }

  async remove(commentId: string, params: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const dataQuery = `DELETE FROM  \`comments_fires\` WHERE commentId=:commentId AND creatorId=:creatorId`
    await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: {
        commentId,
        creatorId
      }
    })
    return {
      commentId,
      creatorAuthorId: creatorId
    }
  }
}
