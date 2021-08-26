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
 export class UserReport extends Service {
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
 
 
   async create(data: any, params?: Params): Promise<any> {
     const { user_report: userReportModel } = this.app.get('sequelizeClient').models
     const creatorId = await getCreatorByUserId(
       extractLoggedInUserFromParams(params)?.userId,
       this.app.get('sequelizeClient')
     )
     const newReport = await userReportModel.create({ creatorId: data.creatorId})
     return newReport;
   }
 
  
 }
 