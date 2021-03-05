import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Paginated, Params } from "@feathersjs/feathers";
import { FindAndCountOptions, QueryTypes } from "sequelize";
import { Feed as FeedInterface, FeedShort as FeedShortInterface, FeedDatabaseRow } from '../../../../common/interfaces/Feed';
import { extractLoggedInUserFromParams } from "../auth-management/auth-management.utils";

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
    const limit = params.query?.$limit ? params.query.$limit : 10;

    const {
      feed_bookmark:feedBookmarkModel,
      feed_fires:feedFiresModel,
      user:userModel,
      feed:feedModel
    } = this.app.get('sequelizeClient').models;


    const options: FindAndCountOptions = {
      offset: skip,
      limit,
      order: [ [ 'createdAt', 'ASC' ] ] // order not used in find?
    };

    if (action === 'featured') {
      options.where = { featured: true };
      const feeds = await feedModel.findAndCountAll(options) as FindAndCountResultInterface<FeedDatabaseRow>;

      // use promise here as we will later get preview from static_resources
      const data = await Promise.all(feeds.rows.map(async feed => {
        const newFeed: FeedShortInterface = {
          id: feed.id,
          preview: "https://picsum.photos/375/210",
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
    ];
    const feeds = await feedModel.findAndCountAll(options) as FindAndCountResultInterface<FeedDatabaseRow>;

    const loggedInUser = extractLoggedInUserFromParams(params);
    const data = feeds.rows.map(feed => {
      // @ts-ignore
      const { user, feed_fires } = feed;
      const isFired = loggedInUser?.userId? !!feed_fires.find(feedFire => feedFire.authorId === loggedInUser.userId) : false;
      const isBookmarked = false;//loggedInUser?.userId? !!feedBookmarks.rows.find(bookmark => bookmark.authorId === loggedInUser.userId) : false;

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
        fires: feed_fires.count,
        isFired,
        isBookmarked,
        id: feed.id,
        preview: "https://picsum.photos/375/210",
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
      total: feeds.count,
    };

    return feedsResult;
  }
}
