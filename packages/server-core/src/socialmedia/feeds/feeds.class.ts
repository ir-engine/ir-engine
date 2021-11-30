/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'
import { TheFeeds as FeedsInterface } from '@xrengine/common/src/interfaces/Feeds'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'
import { getCreatorByUserId } from '../util/getCreator'
/**
 * A class for ARC TheFeeds service
 */

// const thefeeds = '';
// conts TheFeeds = '';

export class TheFeeds extends Service {
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

    const queryParamsReplacements = {
      skip,
      limit
    } as any

    //All TheFeeds as Admin
    // if (action === 'admin') {
    //   const dataQuery = `SELECT thefeeds.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName,
    //   sr1.url as videoUrl, sr3.url as avatar
    //     FROM \`thefeeds\` as thefeeds
    //     JOIN \`creator\` as creator ON creator.id=thefeeds.creatorId
    //     JOIN \`static_resource\` as sr1 ON sr1.id=thefeeds.videoId
    //     LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
    //     WHERE 1
    //     GROUP BY thefeeds.id
    //     ORDER BY thefeeds.createdAt DESC
    //     LIMIT :skip, :limit `;
    const dataQuery = `SELECT thefeeds.*, sr1.url as videoUrl, COUNT(ff.id) as fires
        FROM \`thefeeds\` as thefeeds
        JOIN \`static_resource\` as sr1 ON sr1.id=thefeeds.videoId
        LEFT JOIN \`thefeeds_fires\` as ff ON ff.thefeedsId=thefeeds.id
        WHERE 1
        GROUP BY thefeeds.id
        ORDER BY thefeeds.createdAt DESC
        LIMIT :skip, :limit `

    // console.log(dataQuery)
    const thefeeds = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { ...queryParamsReplacements }
    })
    return {
      data: thefeeds,
      skip,
      limit,
      total: thefeeds.count
    }
    // }
    const loggedInUser = extractLoggedInUserFromParams(params)
    const creatorId = params.query?.creatorId
      ? params.query!.creatorId
      : await getCreatorByUserId(loggedInUser?.userId, this.app.get('sequelizeClient'))
  }

  /**
   * A function which is used to find specific project
   *
   * @param id of single thefeeds
   * @param params contains current user
   * @returns {@Object} contains specific thefeeds
   * @author Gleb Ordinsky
   */
  // async get (id: Id, params: Params): Promise<any> {
  async get(id: Id, params: Params): Promise<any> {
    // async get (params: Params): Promise<any> {
    //   let select = `SELECT thefeeds.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, sr3.url as avatar,
    //   sr1.url as videoId `;
    let select = `SELECT thefeeds.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, 
      sr1.url as videoId `
    const from = ` FROM \`thefeeds\` as thefeeds`
    let join = ` JOIN \`creator\` as creator  
                    JOIN \`static_resource\` as sr1 ON sr1.id=thefeeds.videoId
                    JOIN \`static_resource\` as sr2 ON sr2.id=thefeeds.previewId
                    `
    const where = ` WHERE thefeeds.id=:id`

    const queryParamsReplacements = {
      id
    } as any

    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    if (creatorId) {
      select += ` , isf.id as fired, isb.id as bookmarked `
      join += ` LEFT JOIN \`feedsfires\` as isf ON isf.feedsId=thefeeds.id  AND isf.creatorId=:creatorId
                  LEFT JOIN \`feedsbookmark\` as isb ON isb.feedsId=thefeeds.id  AND isb.creatorId=:creatorId`
      queryParamsReplacements.creatorId = creatorId
    }

    const dataQuery = select + from + join + where
    const [thefeeds] = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })

    const newTheFeeds: FeedsInterface = {
      creator: {
        id: thefeeds.creatorId,
        avatar: thefeeds.avatar,
        name: thefeeds.creatorName,
        username: thefeeds.creatorUserName,
        verified: !!+thefeeds.creatorVerified
      },
      description: thefeeds.description,
      id: thefeeds.id,
      videoUrl: thefeeds.videoUrl,
      title: thefeeds.title
    }
    return newTheFeeds
  }

  async create(data: any, params: Params): Promise<any> {
    console.log('Backend create')
    const { thefeeds: thefeedsModel } = this.app.get('sequelizeClient').models
    // data.creatorId = await getCreatorByUserId(extractLoggedInUserFromParams(params)?.userId, this.app.get('sequelizeClient'));
    const newTheFeeds = await thefeedsModel.create(data)

    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100

    const queryParamsReplacements = {
      skip,
      limit
    } as any

    const videoId = newTheFeeds.dataValues.videoId

    const TheFeedsWithVideo = await this.app
      .get('sequelizeClient')
      .query('select url from static_resource where id = "' + videoId + '"', {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })

    const url: any = TheFeedsWithVideo[0].url

    return { ...newTheFeeds.dataValues, videoUrl: url }
  }

  /**
   * A function which is used to update viewsCount field of TheFeeds
   *
   * @param id of thefeeds to update
   * @param params
   * @returns updated thefeeds
   * @author
   */
  async patch(id: string, data: any, params: Params): Promise<any> {
    console.log('server', id)
    console.log('server', data)
    const { thefeeds: thefeedsModel } = this.app.get('sequelizeClient').models
    let result = null as any
    if (data.viewsCount) {
      const thefeedsItem = await thefeedsModel.findOne({ where: { id: id } })
      if (!thefeedsItem) {
        return Promise.reject(new BadRequest('Could not update thefeeds. TheFeeds not found! '))
      }
      result = await super.patch(thefeedsItem.id, {
        viewsCount: (thefeedsItem.viewsCount as number) + 1
      })
    } else {
      result = await super.patch(id, data)
    }

    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100
    const queryParamsReplacements = {
      skip,
      limit
    } as any

    const videoId = result.videoId
    const theFeedsWithVideo = await this.app
      .get('sequelizeClient')
      .query('select url from static_resource where id = "' + videoId + '"', {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })
    const url: any = theFeedsWithVideo[0].url
    return { ...result, videoUrl: url }
  }
}
