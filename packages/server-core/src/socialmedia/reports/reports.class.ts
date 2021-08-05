/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'
import { Reports as ReportsInterface } from '@xrengine/common/src/interfaces/Reports'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'
import { getCreatorByUserId } from '../util/getCreator'
/**
 * A class for ARC Reports service
 */

// const reports = '';
// conts Reports = '';
// REPORTS
// thefeeds
// feeds
// TheFeeds
// Thefeeds
// THEFEEDS
// videoId
// feedId

export class Reports extends Service {
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

    const dataQuery = `SELECT reports.*, sr1.url as videoUrl, COUNT(ff.id) as fires
        FROM \`reports\` as reports
        JOIN \`static_resource\` as sr1 ON sr1.id=reports.feedId
        LEFT JOIN \`reports_fires\` as ff ON ff.reportsId=reports.id
        WHERE 1
        GROUP BY reports.id
        ORDER BY reports.createdAt DESC
        LIMIT :skip, :limit `

    // console.log(dataQuery)
    const reports = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { ...queryParamsReplacements }
    })
    return {
      data: reports,
      skip,
      limit,
      total: reports.count
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
   * @param id of single reports
   * @param params contains current user
   * @returns {@Object} contains specific reports
   * @author Gleb Ordinsky
   */
  // async get (id: Id, params?: Params): Promise<any> {
  async get(id: Id, params?: Params): Promise<any> {
    // async get (params?: Params): Promise<any> {
    //   let select = `SELECT reports.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, sr3.url as avatar,
    //   sr1.url as feedId `;
    let select = `SELECT reports.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName,
      sr1.url as feedId `
    const from = ` FROM \`reports\` as reports`
    let join = ` JOIN \`creator\` as creator
                    JOIN \`static_resource\` as sr1 ON sr1.id=reports.feedId
                    JOIN \`static_resource\` as sr2 ON sr2.id=reports.previewId
                    `
    const where = ` WHERE reports.id=:id`

    const queryParamsReplacements = {
      id
    } as any

    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    if (creatorId) {
      select += ` , isf.id as fired, isb.id as bookmarked `
      join += ` LEFT JOIN \`feedsfires\` as isf ON isf.feedsId=reports.id  AND isf.creatorId=:creatorId
                  LEFT JOIN \`feedsbookmark\` as isb ON isb.feedsId=reports.id  AND isb.creatorId=:creatorId`
      queryParamsReplacements.creatorId = creatorId
    }

    const dataQuery = select + from + join + where
    const [reports] = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })

    const newReports: ReportsInterface = {
      creator: {
        id: reports.creatorId,
        avatar: reports.avatar,
        name: reports.creatorName,
        username: reports.creatorUserName,
        verified: !!+reports.creatorVerified
      },
      description: reports.description,
      id: reports.id,
      videoUrl: reports.videoUrl,
      title: reports.title
    }
    return newReports
  }

  async create(data: any, params?: Params): Promise<any> {
    console.log('Backend create')
    const { reports: reportsModel } = this.app.get('sequelizeClient').models
    // data.creatorId = await getCreatorByUserId(extractLoggedInUserFromParams(params)?.userId, this.app.get('sequelizeClient'));
    const newReports = await reportsModel.create(data)

    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100

    const queryParamsReplacements = {
      skip,
      limit
    } as any

    const feedId = newReports.dataValues.feedId

    const ReportsWithVideo = await this.app
      .get('sequelizeClient')
      .query('select url from static_resource where id = "' + feedId + '"', {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })

    const url: any = ReportsWithVideo[0].url

    return { ...newReports.dataValues, videoUrl: url }
  }

  /**
   * A function which is used to update viewsCount field of Reports
   *
   * @param id of reports to update
   * @param params
   * @returns updated reports
   * @author
   */
  async patch(id: string, data?: any, params?: Params): Promise<any> {
    console.log('server', id)
    console.log('server', data)
    const { reports: reportsModel } = this.app.get('sequelizeClient').models
    let result = null
    if (data.viewsCount) {
      const reportsItem = await reportsModel.findOne({ where: { id: id } })
      if (!reportsItem) {
        return Promise.reject(new BadRequest('Could not update reports. Reports not found! '))
      }
      result = await super.patch(reportsItem.id, {
        viewsCount: (reportsItem.viewsCount as number) + 1
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

    const feedId = result.feedId
    const ReportsWithVideo = await this.app
      .get('sequelizeClient')
      .query('select url from static_resource where id = "' + feedId + '"', {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })
    const url: any = ReportsWithVideo[0].url
    return { ...result, videoUrl: url }
  }
}
