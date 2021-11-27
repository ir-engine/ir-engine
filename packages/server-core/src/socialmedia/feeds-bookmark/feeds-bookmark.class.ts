/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Params } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { QueryTypes } from 'sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { getCreatorByUserId } from '../util/getCreator'

// const thefeeds = '';
// conts TheFeeds = '';

/**
 * A class for ARC TheFeeds-bookmark service
 */
export class TheFeedsBookmark extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: any, params: Params): Promise<any> {
    const { thefeeds_bookmark: thefeedsBookmarkModel } = this.app.get('sequelizeClient').models
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const newBookmark = await thefeedsBookmarkModel.create({ thefeedsId: data.thefeedsId, creatorId })
    return newBookmark
  }

  async remove(thefeedsId: string, params: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    const dataQuery = `DELETE FROM  \`thefeeds_bookmark\`
    WHERE thefeedsId=:thefeedsId AND creatorId=:creatorId`
    await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: {
        thefeedsId: thefeedsId,
        creatorId
      }
    })
  }
}
