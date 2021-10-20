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
export class FeedBookmark extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: any, params?: Params): Promise<any> {
    const { feed_bookmark: feedBookmarkModel } = this.app.get('sequelizeClient').models
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const newBookmark = await feedBookmarkModel.create({ feedId: data.feedId, creatorId })
    return newBookmark
  }

  async remove(feedId: string, params?: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const dataQuery = `DELETE FROM  \`feed_bookmark\`  
    WHERE feedId=:feedId AND creatorId=:creatorId`
    await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: {
        feedId: feedId,
        creatorId
      }
    })
  }
}
