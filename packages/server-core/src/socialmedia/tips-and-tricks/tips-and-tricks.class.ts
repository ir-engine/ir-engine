/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'
import { TipsAndTricks as TipsAndTricksInterface } from '@xrengine/common/src/interfaces/TipsAndTricks'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'
import { getCreatorByUserId } from '../util/getCreator'
/**
 * A class for ARC TipsAndTricks service
 */

export class TipsAndTricks extends Service {
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

    //All TipsAndTricks as Admin
    // if (action === 'admin') {
    //   const dataQuery = `SELECT tips_and_tricks.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName,
    //   sr1.url as videoUrl, sr3.url as avatar
    //     FROM \`tips_and_tricks\` as tips_and_tricks
    //     JOIN \`creator\` as creator ON creator.id=tips_and_tricks.creatorIds
    //     JOIN \`static_resource\` as sr1 ON sr1.id=tips_and_tricks.videoId
    //     LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
    //     WHERE 1
    //     GROUP BY tips_and_tricks.id
    //     ORDER BY tips_and_tricks.createdAt DESC
    //     LIMIT :skip, :limit `;

    const dataQuery = `SELECT tips_and_tricks.*, sr1.url as videoUrl   
        FROM \`tips_and_tricks\` as tips_and_tricks
        JOIN \`static_resource\` as sr1 ON sr1.id=tips_and_tricks.videoId
        WHERE 1
        GROUP BY tips_and_tricks.id
        ORDER BY tips_and_tricks.createdAt DESC
        LIMIT :skip, :limit `

    // console.log(dataQuery)
    const tips_and_tricks = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { ...queryParamsReplacements }
    })
    return {
      data: tips_and_tricks,
      skip,
      limit,
      total: tips_and_tricks.count
    }
    // }
    const loggedInUser = extractLoggedInUserFromParams(params)
    const creatorId = params.query?.creatorId
      ? params.query.creatorId
      : await getCreatorByUserId(loggedInUser?.userId, this.app.get('sequelizeClient'))
  }

  /**
   * A function which is used to find specific project
   *
   * @param id of single tips-and-tricks
   * @param params contains current user
   * @returns {@Object} contains specific tips-and-tricks
   * @author Gleb Ordinsky
   */
  // async get (id: Id, params?: Params): Promise<any> {
  async get(id: Id, params?: Params): Promise<any> {
    // async get (params?: Params): Promise<any> {
    //   let select = `SELECT tips_and_tricks.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, sr3.url as avatar,
    //   sr1.url as videoUrl `;
    const select = `SELECT tips_and_tricks.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, 
      sr1.url as videoUrl `
    const from = ` FROM \`tips_and_tricks\` as tips_and_tricks`
    const join = ` JOIN \`creator\` as creator  
                    JOIN \`static_resource\` as sr1 ON sr1.id=tips_and_tricks.videoId
                    JOIN \`static_resource\` as sr2 ON sr2.id=tips_and_tricks.previewId
                    `
    const where = ` WHERE tips_and_tricks.id=:id`

    const queryParamsReplacements = {
      id
    } as any

    // const creatorId = await getCreatorByUserId(extractLoggedInUserFromParams(params)?.userId, this.app.get('sequelizeClient'));
    //
    // if(creatorId){
    //   select += ` , isf.id as fired, isb.id as bookmarked `;
    //   join += ` LEFT JOIN \`tips_and_tricks_fires\` as isf ON isf.tips_and_tricksId=tips_and_tricks.id  AND isf.creatorId=:creatorId
    //             LEFT JOIN \`tips_and_tricks_bookmark\` as isb ON isb.tips_and_tricksId=tips_and_tricks.id  AND isb.creatorId=:creatorId`;
    //   queryParamsReplacements.creatorId = creatorId;
    // }

    const dataQuery = select + from + join + where
    const [tips_and_tricks] = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })

    const newTipsAndTricks: TipsAndTricksInterface = {
      creator: {
        id: tips_and_tricks.creatorId,
        avatar: tips_and_tricks.avatar,
        name: tips_and_tricks.creatorName,
        username: tips_and_tricks.creatorUserName,
        verified: !!+tips_and_tricks.creatorVerified
      },
      description: tips_and_tricks.description,
      id: tips_and_tricks.id,
      videoUrl: tips_and_tricks.videoUrl,
      title: tips_and_tricks.title
    }
    return newTipsAndTricks
  }

  async create(data: any, params?: Params): Promise<any> {
    console.log('Backend create')
    const { tips_and_tricks: tips_and_tricksModel } = this.app.get('sequelizeClient').models
    // data.creatorId = await getCreatorByUserId(extractLoggedInUserFromParams(params)?.userId, this.app.get('sequelizeClient'));
    const newTipsAndTricks = await tips_and_tricksModel.create(data)

    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100

    const queryParamsReplacements = {
      skip,
      limit
    } as any

    const videoId = newTipsAndTricks.dataValues.videoId

    const thetipsandtricksWithVideo = await this.app
      .get('sequelizeClient')
      .query('select url from static_resource where id = "' + videoId + '"', {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })

    const url: any = thetipsandtricksWithVideo[0].url

    return { ...newTipsAndTricks.dataValues, videoUrl: url }
  }

  /**
   * A function which is used to update viewsCount field of TipsAndTricks
   *
   * @param id of tips-and-tricks to update
   * @param params
   * @returns updated tips-and-tricks
   * @author
   */
  async patch(id: string, data?: any, params?: Params): Promise<any> {
    console.log('server', id)
    console.log('server', data)
    const { tips_and_tricks: tips_and_tricksModel } = this.app.get('sequelizeClient').models
    let result = null
    if (data.viewsCount) {
      const tips_and_tricksItem = await tips_and_tricksModel.findOne({ where: { id: id } })
      if (!tips_and_tricksItem) {
        return Promise.reject(new BadRequest('Could not update tips-and-tricks. TipsAndTricks not found! '))
      }
      result = await super.patch(tips_and_tricksItem.id, {
        viewsCount: (tips_and_tricksItem.viewsCount as number) + 1
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
    const thetipsandtricksWithVideo = await this.app
      .get('sequelizeClient')
      .query('select url from static_resource where id = "' + videoId + '"', {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })

    const url: any = thetipsandtricksWithVideo[0].url
    return { ...result, videoUrl: url }
  }
}
