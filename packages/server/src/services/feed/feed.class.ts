import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Id, Params } from "@feathersjs/feathers";
import { QueryTypes } from "sequelize";
import { Feed as FeedInterface } from '../../../../common/interfaces/Feed';
import { extractLoggedInUserFromParams } from "../auth-management/auth-management.utils";
import { BadRequest } from '@feathersjs/errors';
/**
 * A class for ARC Feed service
 */
export class Feed extends Service {
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

    const queryParamsReplacements = {
      skip,
      limit,
    } as any;

    if (action === 'featured') {
      const dataQuery = `SELECT feed.id, feed.viewsCount, sr.url as previewUrl 
        FROM \`feed\` as feed
        JOIN \`static_resource\` as sr ON sr.id=feed.previewId
        WHERE feed.featured=1
        ORDER BY feed.createdAt DESC    
        LIMIT :skip, :limit 
        `;
      

      const feeds = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: queryParamsReplacements
        });

      return {
        data: feeds,
        skip,
        limit,
        total: feeds.count,
      };
    }

    // regular feeds
    const loggedInUser = extractLoggedInUserFromParams(params);

    let select = `SELECT feed.*, user.id as userId, user.name as userName, COUNT(ff.id) as fires, sr1.url as videoUrl, sr2.url as previewUrl `;
    let from = ` FROM \`feed\` as feed`;
    let join = ` JOIN \`user\` as user ON user.id=feed.authorId
                  LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
                  JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
                  JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
                  `;
    let where = ` WHERE 1`;
    let order = ` GROUP BY feed.id
    ORDER BY feed.createdAt DESC    
    LIMIT :skip, :limit `;

    if(loggedInUser?.userId){
      select += ` , isf.id as fired, isb.id as bookmarked `;
      join += ` LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.authorId=:loggedInUser
                LEFT JOIN \`feed_bookmark\` as isb ON isb.feedId=feed.id  AND isb.authorId=:loggedInUser`;
      queryParamsReplacements.loggedInUser =  loggedInUser.userId;
    }

    const dataQuery = select + from + join + where + order;
    const feeds = await this.app.get('sequelizeClient').query(dataQuery,
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      });

    const data = feeds.map(feed => {
      const newFeed: FeedInterface = {
        creator: {
          userId: feed.userId,
          id:feed.userId,
          avatar: 'https://picsum.photos/40/40',
          name: feed.userName,
          username: feed.userName,
          verified : true,
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
      };

      return newFeed;
    });

    const feedsResult = {
      data,
      skip: skip,
      limit: limit,
      total: feeds.length,
    };

    return feedsResult;
  }

    /**
   * A function which is used to find specific project 
   * 
   * @param id of single feed
   * @param params contains current user 
   * @returns {@Object} contains specific feed
   * @author Vykliuk Tetiana
   */
    async get (id: Id, params?: Params): Promise<any> {
      const loggedInUser = extractLoggedInUserFromParams(params);

      let select = `SELECT feed.*, user.id as userId, user.name as userName, COUNT(ff.id) as fires, sr1.url as videoUrl, sr2.url as previewUrl `;
      let from = ` FROM \`feed\` as feed`;
      let join = ` JOIN \`user\` as user ON user.id=feed.authorId
                    LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
                    JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
                    JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
                    `;
      let where = ` WHERE feed.id=:id`;      

      const queryParamsReplacements = {
        id,
      } as any;


      if(loggedInUser?.userId){
        select += ` , isf.id as fired, isb.id as bookmarked `;
        join += ` LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.authorId=:loggedInUser
                  LEFT JOIN \`feed_bookmark\` as isb ON isb.feedId=feed.id  AND isb.authorId=:loggedInUser`;
        queryParamsReplacements.loggedInUser =  loggedInUser?.userId;
      }
  
      const dataQuery = select + from + join + where;
      const [feed] = await this.app.get('sequelizeClient').query(dataQuery,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: queryParamsReplacements
        });

      const newFeed: FeedInterface = ({
        creator: {
          userId: feed.userId,
          id: feed.userId,
          avatar: 'https://picsum.photos/40/40',
          name: feed.userName,
          username: feed.userName,
          verified : true,
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

    async create (data : any,  params?: Params): Promise<any> {
      const {feed:feedModel} = this.app.get('sequelizeClient').models;
      const loggedInUser = extractLoggedInUserFromParams(params);
      data.authorId = loggedInUser.userId;
      const newFeed =  await feedModel.create(data);
      return  newFeed;
    }
  

      /**
   * A function which is used to update viewsCount field of feed 
   * 
   * @param id of feed to update 
   * @param params 
   * @returns updated feed
   * @author 
   */
  async patch (id: string, data?: any, params?: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params);
    if (!loggedInUser?.userId) {
      return Promise.reject(new BadRequest('Could not update feed. Users isn\'t logged in! '));
    }
    if (!id) {
      return Promise.reject(new BadRequest('Could not update feed. Feed id isn\'t provided! '));
    }
    const {feed:feedModel } = this.app.get('sequelizeClient').models;
    const feedItem = await feedModel.findOne({where: {id: id}});
    if(!feedItem){
      return Promise.reject(new BadRequest('Could not update feed. Feed not found! '));
    }
    return await super.patch(feedItem.id, {
      viewsCount: (feedItem.viewsCount as number) + 1,
    });
  }
}
