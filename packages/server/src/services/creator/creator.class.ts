import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Id, Params } from "@feathersjs/feathers";
import { QueryTypes } from "sequelize";
import { Creator as CreatorInterface } from '../../../../common/interfaces/Creator';
import { extractLoggedInUserFromParams } from "../auth-management/auth-management.utils";
import { BadRequest } from '@feathersjs/errors';
/**
 * A class for ARC Creator service
 */
export class Creator extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  /**
   * @function find it is used to find specific users
   *
   * @param params user id
   * @returns {@Array} of found users
   */

  async find (params: Params): Promise<any> {
    const action = params.query?.action;
    const skip = params.query?.$skip ? params.query.$skip : 0;
    const limit = params.query?.$limit ? params.query.$limit : 100;

    if (action === 'current') {
      const loggedInUser = extractLoggedInUserFromParams(params);
      if(loggedInUser?.userId){
        let select = `SELECT creator.* `;
        const from = ` FROM \`creator\` as creator`;
        let join = ` JOIN \`user\` as user ON user.id=creator.userId`;
        let where = ` WHERE creator.userId=:userId`;      

        let queryParamsReplacements = {userId:loggedInUser.userId} as any;
        const dataQuery = select + from + join + where;

        let [creator] = await this.app.get('sequelizeClient').query(dataQuery,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: queryParamsReplacements
          });
        return creator;        
      }else{
        return {};
      }
    }

    // // regular feeds
    // const loggedInUser = extractLoggedInUserFromParams(params);

    // let select = `SELECT feed.*, user.id as userId, user.name as userName, COUNT(ff.id) as fires, sr1.url as videoUrl, sr2.url as previewUrl `;
    // const from = ` FROM \`feed\` as feed`;
    // let join = ` JOIN \`user\` as user ON user.id=feed.authorId
    //               LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
    //               JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
    //               JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
    //               `;
    // const where = ` WHERE 1`;
    // const order = ` GROUP BY feed.id
    // ORDER BY feed.createdAt DESC    
    // LIMIT :skip, :limit `;

    // if(loggedInUser?.userId){
    //   select += ` , isf.id as fired, isb.id as bookmarked `;
    //   join += ` LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.authorId=:loggedInUser
    //             LEFT JOIN \`feed_bookmark\` as isb ON isb.feedId=feed.id  AND isb.authorId=:loggedInUser`;
    //   queryParamsReplacements.loggedInUser =  loggedInUser.userId;
    // }

    // const dataQuery = select + from + join + where + order;
    // const feeds = await this.app.get('sequelizeClient').query(dataQuery,
    //   {
    //     type: QueryTypes.SELECT,
    //     raw: true,
    //     replacements: queryParamsReplacements
    //   });

    // const data = feeds.map(feed => {
    //   const newFeed: CreatorInterface = {
    //       userId: feed.userId,
    //       id:feed.userId,
    //       avatar: 'https://picsum.photos/40/40',
    //       name: feed.userName,
    //       username: feed.userName,
    //       verified : true,
    //     }       
    //   };

    //   return newFeed;
    // });

    // const feedsResult = {
    //   data,
    //   skip: skip,
    //   limit: limit,
    //   total: feeds.length,
    // };

    // return feedsResult;
  }

    /**
   * A function which is used to find specific project 
   * 
   * @param id of single Creator
   * @param params contains current user 
   * @returns {@Object} contains specific feed
   * @author Vykliuk Tetiana
   */
    async get (id: Id, params?: Params): Promise<any> {
      const select = `SELECT creator.* `;
      const from = ` FROM \`creator\` as creator`;
      const where = ` WHERE creator.id=:id`;      

      const queryParamsReplacements = {id} as any;      
  
      const dataQuery = select + from + where;
      const [creator] = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: queryParamsReplacements
        });
      return creator;
    }

    async create (data: any,  params?: Params): Promise<any> {
      const {creator:creatorModel} = this.app.get('sequelizeClient').models;
      const loggedInUser = extractLoggedInUserFromParams(params);
      data.userId = loggedInUser.userId;
      const creator =  await creatorModel.create(data);
      return  creator;
    }

      /**
   * A function which is used to update creator data
   * 
   * @param id of feed to update 
   * @param params 
   * @returns updated feed
   * @author Vykliuk Tetiana
   */
  async patch (id: string, data?: any, params?: Params): Promise<any> {  
    return await super.patch(id, data);
  }
}
