import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Id, Paginated, Params } from "@feathersjs/feathers";
import { FindAndCountOptions, QueryTypes } from "sequelize";
import { Feed as FeedInterface, FeedShort as FeedShortInterface, FeedDatabaseRow } from '../../../../common/interfaces/Feed';
import { extractLoggedInUserFromParams } from "../auth-management/auth-management.utils";
import { BadRequest } from '@feathersjs/errors';
import { defaultProjectImport } from '../project/project-helper';

interface FindAndCountResultInterface<T> {
  rows: T[];
  count: number;
}

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

    const {
      feed_bookmark:feedBookmarkModel,
      feed_fires:feedFiresModel,
      user:userModel,
      feed:feedModel
    } = this.app.get('sequelizeClient').models;


    const options: FindAndCountOptions = {
      offset: skip,
      limit,
      order: [ [ 'createdAt', 'DESC' ] ] // order not used in find?
    };

    if (action === 'featured') {
      options.where = { featured: true };
      const feeds = await feedModel.findAndCountAll(options) as FindAndCountResultInterface<FeedDatabaseRow>;

      // use promise here as we will later get preview from static_resources
      const data = await Promise.all(feeds.rows.map(async feed => {
        const newFeed: FeedShortInterface = {
          id: feed.id,
          preview: feed.preview,
          viewsCount: feed.viewsCount
        };

        return newFeed;
      }));

      return {
        data,
        skip,
        limit,
        total: feeds.count,
      };
    }

    // regular feeds
    options.include = [
      { model: userModel, as: 'user' },
      { model: feedFiresModel, as: 'feed_fires' },
      // { model: feedBookmarkModel, as: 'feed_bookmark' },
    ];
    // const feeds = await feedModel.findAndCountAll(options) as FindAndCountResultInterface<FeedDatabaseRow>;

    const dataQuery = `SELECT feed.*, user.id as userId, user.name as userName, COUNT(ff.id) as fires
    FROM \`feed\` as feed
    JOIN \`user\` as user ON user.id=feed.authorId
    LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
    WHERE 1 
    GROUP BY feed.id
    ORDER BY feed.createdAt DESC    
    LIMIT :skip, :limit 
    `;
    const feeds = await this.app.get('sequelizeClient').query(dataQuery,
      {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
          skip,
          limit
        }
      });

    const loggedInUser = extractLoggedInUserFromParams(params);
    const data = feeds.map(feed => {
      // @ts-ignore
      const { user } = feed;
      const isFired = false;
      // const isFired = loggedInUser?.userId? !!feed_fires.find(feedFire => feedFire.authorId === loggedInUser.userId) : false;
      const isBookmarked = false;
      //loggedInUser?.userId? !!feedBookmarks.rows.find(bookmark => bookmark.authorId === loggedInUser.userId) : false;

      const newFeed: FeedInterface = {
        creator: { // TODO: get creator from corresponding table
          userId: feed.userId,
          id:feed.userId,
          avatar: 'https://picsum.photos/40/40',
          name: feed.userName,
          username: feed.userName,
          verified : true,
        },
        description: feed.description,
        fires: feed.fires,
        isFired,
        isBookmarked,
        id: feed.id,
        preview: feed.preview,
        stores: 0,
        title: feed.title,
        video: "",
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
      const {
        feed_bookmark:feedBookmarkModel,
        feed_fires:feedFiresModel,
        user:userModel,
        feed:feedModel
      } = this.app.get('sequelizeClient').models;
  
      const feed = await feedModel.findOne({
          where: {
            id: id
          },
          include: [
            { model: userModel, as: 'user' },
            { model: feedFiresModel, as: 'feed_fires' },
          ]
        });

        if (!feed) {
          return Promise.reject(new BadRequest('Feed not found Or you don\'t have access!'));
        }

      const loggedInUser = extractLoggedInUserFromParams(params);

      const dataQuery = `SELECT id
        FROM \`feed_bookmark\`
        WHERE feedId=:feedId AND authorId=:authorId`;
        const isBookmarkedInTable =loggedInUser?.userId ? await this.app.get('sequelizeClient').query(dataQuery,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: {
              feedId:feed.id, 
              authorId:loggedInUser?.userId
            }
          }) : false;

        const firesDataQuery = `SELECT id
          FROM \`feed_fires\`
          WHERE feedId=:feedId AND authorId=:authorId`;
        const isFiredInTable = loggedInUser?.userId ? await this.app.get('sequelizeClient').query(firesDataQuery,
            {
              type: QueryTypes.SELECT,
              raw: true,
              replacements: {
                feedId:feed.id, 
                authorId:loggedInUser?.userId
              }
            }) : false;
    
      // @ts-ignore
      const { user } = feed;

      const newFeed: FeedInterface = {
        creator: { // TODO: get creator from corresponding table
          userId: user.id,
          id: user.id,
          avatar: 'https://picsum.photos/40/40',
          name: user.name,
          username: user.name,
          verified : true,
        },
        description: feed.description,
        fires: feed.feed_fires.length,
        isFired:isFiredInTable.length > 0,
        isBookmarked:isBookmarkedInTable.length > 0,
        id: feed.id,
        preview: feed.preview,
        stores: 0,
        title: feed.title,
        video: "",
        viewsCount: feed.viewsCount
      };      
      return newFeed;
    }

    async create (data : any,  params?: Params): Promise<any> {
      const {feed:feedModel} = this.app.get('sequelizeClient').models;
      const loggedInUser = extractLoggedInUserFromParams(params);
      data.authorId = loggedInUser?.userId;
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
