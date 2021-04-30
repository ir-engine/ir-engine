/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../../declarations';
import { Id, Params } from "@feathersjs/feathers";
import { QueryTypes } from "sequelize";
import { extractLoggedInUserFromParams } from "../../user/auth-management/auth-management.utils";
import { getCreatorByUserId } from '../util/getCreator';
import arMediaModel from './ar-media.model';
/**
 * A class for ARC ArMedia clips and backgrounds service
 */
export class ArMedia extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  /**
   * @function find it is used to find specific users
   *
   * @param params 
   * @returns {@Array} of found users
   * @author Vykliuk Tetiana <tanya.vykliuk@gmail.com>
   */

  async find (params: Params): Promise<any> {
    const action = params.query?.action;
    const skip = params.query?.$skip ? params.query.$skip : 0;
    const limit = params.query?.$limit ? params.query.$limit : 100;

    console.log('action', action);

    const queryParamsReplacements = {
      skip,
      limit,
    } as any;

    //All ArMedia as Admin
    if (action === 'admin') {
      const dataQuery = `SELECT ar.id as ar_id, ar.title as ar_title, ar.type as ar_type, ar.createdAt as ar_createdAt, col.*
        FROM \`ar_media\` as ar
        JOIN \`collection\` as col ON col.id=ar.collectionId        
        WHERE 1
        ORDER BY ar.createdAt DESC    
        LIMIT :skip, :limit `;

      const list = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {...queryParamsReplacements}
        });

      return {
        data: list,
        skip,
        limit,
        total: list.count,
      };
    }

    //All ArMedia
      const dataQuery = `SELECT ar.id as ar_id, ar.title as ar_title, ar.type as ar_type, ar.createdAt as ar_createdAt, col.*
        FROM \`ar_media\` as ar
        JOIN \`collection\` as col ON col.id=ar.collectionId        
        WHERE 1
        ORDER BY ar.createdAt DESC    
        LIMIT :skip, :limit `;

      console.log('dataQuery',dataQuery);
      const list = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {...queryParamsReplacements}
        });

      console.log('list',list);


      return {
        data: list,
        skip,
        limit,
        total: list.count,
      };
   }

    /**
   * A function which is used to find specific project 
   * 
   * @param id of single feed
   * @param params contains current user 
   * @returns {@Object} contains specific feed
   * @author Vykliuk Tetiana <tanya.vykliuk@gmail.com>
   */
    async get (id: Id, params?: Params): Promise<any> {
      let select = `SELECT feed.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, sr3.url as avatar, 
      creator.verified as creatorVerified, COUNT(ff.id) as fires, sr1.url as videoUrl, sr2.url as previewUrl `;
      const from = ` FROM \`feed\` as feed`;
      let join = ` JOIN \`creator\` as creator ON creator.id=feed.creatorId
                    LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
                    JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
                    JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
                    LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
                    `;
      const where = ` WHERE feed.id=:id`;      

      const queryParamsReplacements = {
        id,
      } as any;

      const creatorId = await getCreatorByUserId(extractLoggedInUserFromParams(params)?.userId, this.app.get('sequelizeClient'));

      if(creatorId){
        select += ` , isf.id as fired, isb.id as bookmarked `;
        join += ` LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.creatorId=:creatorId
                  LEFT JOIN \`feed_bookmark\` as isb ON isb.feedId=feed.id  AND isb.creatorId=:creatorId`;
        queryParamsReplacements.creatorId = creatorId; 
      }
  
      const dataQuery = select + from + join + where;
      const [feed] = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: queryParamsReplacements
        });

      const newFeed: any = ({
        creator: {
          id: feed.creatorId,
          avatar: feed.avatar,
          name: feed.creatorName,
          username: feed.creatorUserName,
          verified : !!+feed.creatorVerified,
        },
        description: feed.description,
        fires: feed.fires,
        isFired: feed.fired ? true : false,
        isBookmarked: feed.bookmarked ? true : false,
        id: feed.id,
        videoUrl: feed.videoUrl,
        previewUrl: feed.previewUrl,
        title: feed.title,
        viewsCount: feed.viewsCount
      });     
      return newFeed;
    }

    async create (data: any,  params?: Params): Promise<any> {
      const {ar_media:ArMediaModel} = this.app.get('sequelizeClient').models;
      return await ArMediaModel.create(data);
    }

      /**
   * A function which is used to update
   * 
   * @param id to update 
   * @param params 
   * @returns updated 
   * @author Vykliuk Tetiana <tanya.vykliuk@gmail.com>
   */
  async patch (id: string, data?: any, params?: Params): Promise<any> {
    return await super.patch(id, data);    
  }
}
