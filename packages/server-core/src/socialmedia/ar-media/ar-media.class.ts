/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { getCreatorByUserId } from '../util/getCreator'
import arMediaModel from './ar-media.model'
/**
 * A class for ARC ArMedia clips and backgrounds service
 */
export class ArMedia extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * @function
   *
   * @param params
   * @returns {@Array}
   * @author Vykliuk Tetiana <tanya.vykliuk@gmail.com>
   */

  async find(params: Params): Promise<any> {
    const action = params.query?.action
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100

    const queryParamsReplacements = {
      skip,
      limit
    } as any

    //All ArMedia as Admin
    if (action === 'admin') {
      const dataQuery = `SELECT ar.*, sr1.url as manifestUrl, sr2.url as previewUrl, sr3.url as dracosisUrl, sr4.url as audioUrl
        FROM \`ar_media\` as ar
        JOIN \`static_resource\` as sr1 ON sr1.id=ar.manifestId
        JOIN \`static_resource\` as sr2 ON sr2.id=ar.previewId   
        JOIN \`static_resource\` as sr3 ON sr3.id=ar.dracosisId   
        JOIN \`static_resource\` as sr4 ON sr4.id=ar.audioId 
        WHERE 1
        ORDER BY ar.createdAt DESC    
        LIMIT :skip, :limit `

      const list = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })

      return {
        data: list,
        skip,
        limit,
        total: list.count
      }
    }

    //All ArMedia
    const dataQuery = `SELECT ar.*, 
      sr1.url as manifestUrl, sr2.url as previewUrl, sr3.url as dracosisUrl, sr4.url as audioUrl
        FROM \`ar_media\` as ar
        JOIN \`static_resource\` as sr1 ON sr1.id=ar.manifestId
        JOIN \`static_resource\` as sr2 ON sr2.id=ar.previewId   
        JOIN \`static_resource\` as sr3 ON sr3.id=ar.dracosisId   
        JOIN \`static_resource\` as sr4 ON sr4.id=ar.audioId   
        WHERE 1
        ORDER BY ar.createdAt DESC    
        LIMIT :skip, :limit `

    console.log('dataQuery', dataQuery)
    const list = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { ...queryParamsReplacements }
    })

    console.log('list', list)

    return {
      data: list,
      skip,
      limit,
      total: list.count
    }
  }

  /**
   * A function which is used to find specific ar media item
   *
   * @param id of single item
   * @param params contains current user
   * @returns {@Object} contains specific item
   * @author Vykliuk Tetiana <tanya.vykliuk@gmail.com>
   */
  async get(id: Id, params: Params): Promise<any> {
    const dataQuery = `SELECT ar.*,
                                sr1.url as manifestUrl, sr2.url as previewUrl, sr3.url as dracosisUrl, sr4.url as audioUrl
                         FROM \`ar_media\` as ar
                                  JOIN \`static_resource\` as sr1 ON sr1.id=ar.manifestId
                                  JOIN \`static_resource\` as sr2 ON sr2.id=ar.previewId
                                  JOIN \`static_resource\` as sr3 ON sr3.id=ar.dracosisId
                                  JOIN \`static_resource\` as sr4 ON sr4.id=ar.audioId
                         WHERE ar.id=:id
                         LIMIT 1`

    const [item] = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { id }
    })

    return item
  }

  async create(data: any, params: Params): Promise<any> {
    const { ar_media: ArMediaModel } = this.app.get('sequelizeClient').models
    return await ArMediaModel.create(data)
  }

  /**
   * A function which is used to update
   *
   * @param id to update
   * @param params
   * @returns updated
   * @author Vykliuk Tetiana <tanya.vykliuk@gmail.com>
   */
  async patch(id: string, data: any, params: Params): Promise<any> {
    return await super.patch(id, data)
  }
}
