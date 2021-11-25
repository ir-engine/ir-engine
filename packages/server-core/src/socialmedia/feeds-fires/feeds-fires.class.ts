/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { BadRequest } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { QueryTypes } from 'sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { getCreatorByUserId } from '../util/getCreator'

// const thefeeds = '';
// conts TheFeeds = '';

/**
 * A class for ARC Feed service
 */
export class TheFeedsFires extends Service {
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

    const { thefeeds_fires: thefeedsFiresModel, creator: creatorModel } = this.app.get('sequelizeClient').models

    const thefeeds_fired_users = await thefeedsFiresModel.findAndCountAll({
      where: {
        thefeedsId: params.query?.thefeedsId
      },
      offset: skip,
      limit,
      include: [{ model: creatorModel, as: 'creator' }],
      order: [['createdAt', 'DESC']] // order not used in find?
    })

    const data = thefeeds_fired_users.rows.map((fire) => {
      const creator = fire.creator.dataValues
      return {
        // TODO: get creator from corresponding table
        id: creator.id,
        avatar: creator.avatar,
        name: creator.name,
        username: creator.username,
        verified: !!+creator.verified,
        thefeedsId: fire.thefeedsId
      }
    })
    const thefeedsResult = {
      data,
      skip: skip,
      limit: limit,
      total: thefeeds_fired_users.count
    }

    return thefeedsResult
  }

  async create(data: any, params: Params): Promise<any> {
    const { thefeeds_fires: thefeedsFiresModel } = this.app.get('sequelizeClient').models
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const newFire = await thefeedsFiresModel.create({ thefeedsId: data.thefeedsId, creatorId })
    return newFire
  }

  async remove(thefeedsId: string, params: Params): Promise<any> {
    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const dataQuery = `DELETE FROM  \`thefeeds_fires\` WHERE thefeedsId=:thefeedsId AND creatorId=:creatorId`
    await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.DELETE,
      raw: true,
      replacements: {
        thefeedsId: thefeedsId,
        creatorId
      }
    })
    return thefeedsId
  }
}
