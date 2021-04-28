/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../../declarations';
import { Id, Params } from "@feathersjs/feathers";
import { QueryTypes } from "sequelize";
import { TipsAndTricks as TipsAndTricksInterface } from '@xr3ngine/common/src/interfaces/TipsAndTricks';
import { extractLoggedInUserFromParams } from "../../user/auth-management/auth-management.utils";
import { BadRequest } from '@feathersjs/errors';
import { getCreatorByUserId } from '../util/getCreator';
/**
 * A class for ARC TipsAndTricks service
 */


export class TipsAndTricks extends Service {
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

    //All TipsAndTricks as Admin
    if (action === 'admin') {
      const dataQuery = `SELECT tips_and_tricks.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, 
      sr2.url as previewUrl, sr1.url as videoUrl, sr3.url as avatar, COUNT(ff.id) as fires, COUNT(fb.id) as bookmarks 
        FROM \`tips_and_tricks\` as tips_and_tricks
        JOIN \`creator\` as creator ON creator.id=tips_and_tricks.creatorId
        JOIN \`static_resource\` as sr1 ON sr1.id=tips_and_tricks.videoId
        JOIN \`static_resource\` as sr2 ON sr2.id=tips_and_tricks.previewId
        LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
        LEFT JOIN \`tips_and_tricks_bookmark\` as fb ON fb.tips_and_tricksId=tips_and_tricks.id
        WHERE 1
        GROUP BY tips_and_tricks.id
        ORDER BY tips_and_tricks.createdAt DESC    
        LIMIT :skip, :limit `;

      const tips_and_tricks = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {...queryParamsReplacements}
        });

      return {
        data: tips_and_tricks,
        skip,
        limit,
        total: tips_and_tricks.count,
      };
    }
    const loggedInUser = extractLoggedInUserFromParams(params);
    const creatorId =  params.query?.creatorId ? params.query.creatorId : await getCreatorByUserId(loggedInUser?.userId, this.app.get('sequelizeClient'));
  

    //Featured  menu item for Guest
    // if (action === 'featuredGuest') {
    //   const select = `SELECT tips_and_tricks.id, tips_and_tricks.viewsCount, sr.url as previewUrl
    //     FROM \`tips_and_tricks\` as tips_and_tricks
    //     LEFT JOIN \`follow_creator\` as fc ON fc.creatorId=tips_and_tricks.creatorId
    //     JOIN \`static_resource\` as sr ON sr.id=tips_and_tricks.previewId`;
    //    const where=` WHERE (tips_and_tricks.featured=1 OR tips_and_tricks.featuredByAdmin=1) `;
    //    const orderBy = ` ORDER BY tips_and_tricks.createdAt DESC
    //     LIMIT :skip, :limit `;
    //
    //   const tips_and_tricks = await this.app.get('sequelizeClient').query(select+where+orderBy,
    //     {
    //       type: QueryTypes.SELECT,
    //       raw: true,
    //       replacements: queryParamsReplacements
    //     });
    //
    //   return {
    //     data: tips_and_tricks,
    //     skip,
    //     limit,
    //     total: tips_and_tricks.count,
    //   };
    // }



    //Featured menu item
    // if (action === 'featured') {
    //   const select = `SELECT tips_and_tricks.id, tips_and_tricks.viewsCount, sr.url as previewUrl
    //     FROM \`tips_and_tricks\` as tips_and_tricks
    //     LEFT JOIN \`follow_creator\` as fc ON fc.creatorId=tips_and_tricks.creatorId
    //     JOIN \`static_resource\` as sr ON sr.id=tips_and_tricks.previewId`;
    //    let where=` WHERE (tips_and_tricks.featured=1 OR tips_and_tricks.featuredByAdmin=1) `;
    //    const orderBy = ` ORDER BY tips_and_tricks.createdAt DESC
    //     LIMIT :skip, :limit `;
    //
    //   queryParamsReplacements.creatorId = creatorId;
    //   if(loggedInUser){
    //     where += ` AND (fc.followerId=:creatorId OR tips_and_tricks.creatorId=:creatorId)`;
    //   }else{
    //     where += ` AND tips_and_tricks.creatorId=:creatorId`;
    //   }
    //
    //   const tips_and_tricks = await this.app.get('sequelizeClient').query(select+where+orderBy,
    //     {
    //       type: QueryTypes.SELECT,
    //       raw: true,
    //       replacements: queryParamsReplacements
    //     });
    //
    //   return {
    //     data: tips_and_tricks,
    //     skip,
    //     limit,
    //     total: tips_and_tricks.count,
    //   };
    // }




    if (action === 'creator') {
      const dataQuery = `SELECT tips_and_tricks.id, tips_and_tricks.creatorId as previewUrl
        FROM \`tips_and_tricks\` as tips_and_tricks
        JOIN \`static_resource\` as sr ON sr.id=tips_and_tricks.previewId
        WHERE tips_and_tricks.creatorId=:creatorId
        ORDER BY tips_and_tricks.createdAt DESC    
        LIMIT :skip, :limit `;
      
      queryParamsReplacements.creatorId =  params.query?.creatorId ? params.query.creatorId : creatorId;
      const tips_and_tricks = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: queryParamsReplacements
        });

      return {
        data: tips_and_tricks,
        skip,
        limit,
        total: tips_and_tricks.count,
      };
    }

    // if (action === 'myFeatured') {
    //   const dataQuery = `SELECT tips_and_tricks.id, tips_and_tricks.creatorId, tips_and_tricks.featured,  tips_and_tricks.viewsCount, sr.url as previewUrl
    //     FROM \`tips_and_tricks\` as tips_and_tricks
    //     JOIN \`static_resource\` as sr ON sr.id=tips_and_tricks.previewId
    //     WHERE tips_and_tricks.creatorId=:creatorId AND tips_and_tricks.featured=1
    //     ORDER BY tips_and_tricks.createdAt DESC
    //     LIMIT :skip, :limit `;
    //   queryParamsReplacements.creatorId = creatorId;
    //   const tips_and_tricks = await this.app.get('sequelizeClient').query(dataQuery,
    //     {
    //       type: QueryTypes.SELECT,
    //       raw: true,
    //       replacements: queryParamsReplacements
    //     });
    //
    //   return {
    //     data: tips_and_tricks,
    //     skip,
    //     limit,
    //     total: tips_and_tricks.count,
    //   };
    // }

    // if (action === 'bookmark') {
    //   const dataQuery = `SELECT tips_and_tricks.id, tips_and_tricks.viewsCount, sr.url as previewUrl
    //     FROM \`tips_and_tricks\` as tips_and_tricks
    //     JOIN \`static_resource\` as sr ON sr.id=tips_and_tricks.previewId
    //     JOIN \`tips_and_tricks_bookmark\` as fb ON fb.tips_and_tricksId=tips_and_tricks.id
    //     WHERE fb.creatorId=:creatorId
    //     ORDER BY tips_and_tricks.createdAt DESC
    //     LIMIT :skip, :limit `;
    //
    //   queryParamsReplacements.creatorId = creatorId;
    //   const tips_and_tricks = await this.app.get('sequelizeClient').query(dataQuery,
    //     {
    //       type: QueryTypes.SELECT,
    //       raw: true,
    //       replacements: queryParamsReplacements
    //     });
    //
    //   return {
    //     data: tips_and_tricks,
    //     skip,
    //     limit,
    //     total: tips_and_tricks.count,
    //   };
    // }

    // if(action === 'theTipsAndTricksGuest'){
    //   const select = `SELECT tips_and_tricks.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, creator.verified as creatorVerified,
    //   sr3.url as avatar, COUNT(ff.id) as fires, sr1.url as videoUrl, sr2.url as previewUrl `;
    //   const from = ` FROM \`tips_and_tricks\` as tips_and_tricks`;
    //   const join = ` JOIN \`creator\` as creator ON creator.id=tips_and_tricks.creatorId
    //                 JOIN \`static_resource\` as sr1 ON sr1.id=tips_and_tricks.videoId
    //                 JOIN \`static_resource\` as sr2 ON sr2.id=tips_and_tricks.previewId
    //                 LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
    //                 `;
    //   const where = ` WHERE 1`;
    //   const order = ` GROUP BY tips_and_tricks.id
    //   ORDER BY tips_and_tricks.createdAt DESC
    //   LIMIT :skip, :limit `;
    //
    //   const dataQuery = select + from + join + where + order;
    //   const tips_and_tricks = await this.app.get('sequelizeClient').query(dataQuery,
    //     {
    //       type: QueryTypes.SELECT,
    //       raw: true,
    //       replacements: queryParamsReplacements
    //     });
    //
    //   const data = tips_and_tricks.map(tips_and_tricks => {
    //     const newTipsAndTricks: TipsAndTricksInterface = {
    //       creator: {
    //         id:tips_and_tricks.creatorId,
    //         avatar: tips_and_tricks.avatar,
    //         name: tips_and_tricks.creatorName,
    //         username: tips_and_tricks.creatorUserName,
    //         verified : !!+tips_and_tricks.creatorVerified,
    //       },
    //       description: tips_and_tricks.description,
    //       id: tips_and_tricks.id,
    //       videoUrl: tips_and_tricks.videoUrl,
    //       previewUrl: tips_and_tricks.previewUrl,
    //       title: tips_and_tricks.title,
    //       viewsCount: tips_and_tricks.viewsCount
    //     };
    //     return newTipsAndTricks;
    //   });
    //
    // const tips_and_tricksResult = {
    //   data,
    //   skip: skip,
    //   limit: limit,
    //   total: tips_and_tricks.length,
    // };
    //
    // return tips_and_tricksResult;
    // }

    // TheTipsAndTricks menu item - just for followed creatos!!!!!
    let select = `SELECT tips_and_tricks.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, creator.verified as creatorVerified, 
    sr3.url as avatar, COUNT(ff.id) as fires, sr1.url as videoUrl, sr2.url as previewUrl, fc.id as follow_id, fc.creatorId as fc_creatorId, 
    fc.followerId as fc_follower_id  `;
    const from = ` FROM \`tips_and_tricks\` as tips_and_tricks`;
    let join = ` JOIN \`creator\` as creator ON creator.id=tips_and_tricks.creatorId
                  LEFT JOIN \`follow_creator\` as fc ON fc.creatorId=tips_and_tricks.creatorId 
                  LEFT JOIN \`tips_and_tricks_fires\` as ff ON ff.tips_and_tricksId=tips_and_tricks.id 
                  JOIN \`static_resource\` as sr1 ON sr1.id=tips_and_tricks.videoId
                  JOIN \`static_resource\` as sr2 ON sr2.id=tips_and_tricks.previewId
                  LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
                  `;
    const where = ` WHERE fc.followerId=:creatorId OR tips_and_tricks.creatorId=:creatorId`;
    const order = ` GROUP BY tips_and_tricks.id
    ORDER BY tips_and_tricks.createdAt DESC    
    LIMIT :skip, :limit `;

    if(creatorId){
      select += ` , isf.id as fired, isb.id as bookmarked `;
      join += ` LEFT JOIN \`tips_and_tricks_fires\` as isf ON isf.tips_and_tricksId=tips_and_tricks.id  AND isf.creatorId=:creatorId
                LEFT JOIN \`tips_and_tricks_bookmark\` as isb ON isb.tips_and_tricksId=tips_and_tricks.id  AND isb.creatorId=:creatorId`;
      queryParamsReplacements.creatorId =  creatorId;
    }

    const dataQuery = select + from + join + where + order;
    const tips_and_tricks = await this.app.get('sequelizeClient').query(dataQuery,
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      });

    const data = tips_and_tricks.map(tips_and_tricks => {
      const newTipsAndTricks: TipsAndTricksInterface = {
        creator: {
          id:tips_and_tricks.creatorId,
          avatar: tips_and_tricks.avatar,
          name: tips_and_tricks.creatorName,
          username: tips_and_tricks.creatorUserName,
          verified : !!+tips_and_tricks.creatorVerified,
        },
        description: tips_and_tricks.description,
        id: tips_and_tricks.id,
        videoUrl: tips_and_tricks.videoUrl,
        previewUrl: tips_and_tricks.previewUrl,
        title: tips_and_tricks.title,
        viewsCount: tips_and_tricks.viewsCount
      };
      return newTipsAndTricks;
    });

    const tips_and_tricksResult = {
      data,
      skip: skip,
      limit: limit,
      total: tips_and_tricks.length,
    };

    return tips_and_tricksResult;
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
    async get (id: Id, params?: Params): Promise<any> {
    // async get (params?: Params): Promise<any> {
      let select = `SELECT tips_and_tricks.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, sr3.url as avatar, 
      sr1.url as videoUrl, sr2.url as previewUrl `;
      const from = ` FROM \`tips_and_tricks\` as tips_and_tricks`;
      let join = ` JOIN \`creator\` as creator  
                    JOIN \`static_resource\` as sr1 ON sr1.id=tips_and_tricks.videoId
                    JOIN \`static_resource\` as sr2 ON sr2.id=tips_and_tricks.previewId
                    `;
      const where = ` WHERE tips_and_tricks.id=:id`;

      const queryParamsReplacements = {
        // id,
      } as any;

      const creatorId = await getCreatorByUserId(extractLoggedInUserFromParams(params)?.userId, this.app.get('sequelizeClient'));

      if(creatorId){
        select += ` , isf.id as fired, isb.id as bookmarked `;
        join += ` LEFT JOIN \`tips_and_tricks_fires\` as isf ON isf.tips_and_tricksId=tips_and_tricks.id  AND isf.creatorId=:creatorId
                  LEFT JOIN \`tips_and_tricks_bookmark\` as isb ON isb.tips_and_tricksId=tips_and_tricks.id  AND isb.creatorId=:creatorId`;
        queryParamsReplacements.creatorId = creatorId; 
      }
  
      const dataQuery = select + from + join + where;
      const [tips_and_tricks] = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: queryParamsReplacements
        });

      const newTipsAndTricks: TipsAndTricksInterface = ({
        creator: {
          id: tips_and_tricks.creatorId,
          avatar: tips_and_tricks.avatar,
          name: tips_and_tricks.creatorName,
          username: tips_and_tricks.creatorUserName,
          verified : !!+tips_and_tricks.creatorVerified,
        },
        description: tips_and_tricks.description,
        id: tips_and_tricks.id,
        videoUrl: tips_and_tricks.videoUrl,
        previewUrl: tips_and_tricks.previewUrl,
        title: tips_and_tricks.title,
        viewsCount: tips_and_tricks.viewsCount
      });     
      return newTipsAndTricks;
    }








    async create (data: any,  params?: Params): Promise<any> {
      const {tips_and_tricks:tips_and_tricksModel} = this.app.get('sequelizeClient').models;
      // data.creatorId = await getCreatorByUserId(extractLoggedInUserFromParams(params)?.userId, this.app.get('sequelizeClient'));
      const newTipsAndTricks =  await tips_and_tricksModel.create(data);
      return  newTipsAndTricks;
    }









      /**
   * A function which is used to update viewsCount field of TipsAndTricks
   * 
   * @param id of tips-and-tricks to update
   * @param params 
   * @returns updated tips-and-tricks
   * @author 
   */
  async patch (id: string, data?: any, params?: Params): Promise<any> {
    const {tips_and_tricks:tips_and_tricksModel } = this.app.get('sequelizeClient').models;
    let result = null;
    if(data.viewsCount){
      const tips_and_tricksItem = await tips_and_tricksModel.findOne({where: {id: id}});
      if(!tips_and_tricksItem){
        return Promise.reject(new BadRequest('Could not update tips-and-tricks. TipsAndTricks not found! '));
      }
      result = await super.patch(tips_and_tricksItem.id, {
        viewsCount: (tips_and_tricksItem.viewsCount as number) + 1,
      });
    }else{
      result = await super.patch(id, data);
    }
    return result;
    
  }





}
