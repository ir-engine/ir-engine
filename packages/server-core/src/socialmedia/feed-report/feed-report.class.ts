/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
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
export class FeedReport extends Service {
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

  // async find(params: Params): Promise<any> {
  //   const loggedInUser = extractLoggedInUserFromParams(params)
  //   if (!loggedInUser?.userId) {
  //     return Promise.reject(new BadRequest("Could not get reported users list. Users isn't logged in! "))
  //   }
  //   const skip = params.query?.$skip ? params.query.$skip : 0
  //   const limit = params.query?.$limit ? params.query.$limit : 100

  //   const { feed_fires: feedFiresModel, creator: creatorModel } = this.app.get('sequelizeClient').models

  //   const feed_fired_users = await feedFiresModel.findAndCountAll({
  //     where: {
  //       feedId: params.query?.feedId
  //     },
  //     offset: skip,
  //     limit,
  //     include: [{ model: creatorModel, as: 'creator' }],
  //     order: [['createdAt', 'DESC']] // order not used in find?
  //   })

  //   const data = feed_fired_users.rows.map((fire) => {
  //     const creator = fire.creator.dataValues
  //     return {
  //       // TODO: get creator from corresponding table
  //       id: creator.id,
  //       avatar: creator.avatar,
  //       name: creator.name,
  //       username: creator.username,
  //       verified: !!+creator.verified
  //     }
  //   })
  //   const feedsResult = {
  //     data,
  //     skip: skip,
  //     limit: limit,
  //     total: feed_fired_users.count
  //   }

  //   return feedsResult
  // }

  async create(data: any, params: Params): Promise<any> {
    const { feed_report: feedReportModel } = this.app.get('sequelizeClient').models
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const newReport = await feedReportModel.create({ feedId: data.feedId, creatorId })
    return newReport
  }

  //!!!!!unnesessary for now
  // async remove(feedId: string, params: Params): Promise<any> {
  //   const creatorId = await getCreatorByUserId(
  //     extractLoggedInUserFromParams(params)?.userId,
  //     this.app.get('sequelizeClient')
  //   )
  //   const dataQuery = `DELETE FROM  \`feed_report\` WHERE feedId=:feedId AND creatorId=:creatorId`
  //   await this.app.get('sequelizeClient').query(dataQuery, {
  //     type: QueryTypes.DELETE,
  //     raw: true,
  //     replacements: {
  //       feedId: feedId,
  //       creatorId
  //     }
  //   })
  //   return feedId
  // }
}
