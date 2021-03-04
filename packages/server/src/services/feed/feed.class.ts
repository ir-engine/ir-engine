import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Paginated, Params } from "@feathersjs/feathers";
import { QueryTypes } from "sequelize";
import { Feed as FeedInterface, FeedShort as FeedShortInterface, FeedDatabaseRow } from '../../../../common/interfaces/Feed';
import { extractLoggedInUserFromParams } from "../auth-management/auth-management.utils";

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
      user:userModel
    } = this.app.get('sequelizeClient').models;

    // const feeds = this.app.service('feed').Model.findAndCountAll({
    const feeds = await super.find({
      skip,
      limit,
      // order: [ [ 'createdAt', 'ASC' ] ] // order not used in find?
    }) as Paginated<FeedDatabaseRow>;

    if (action === 'featured') {
      const feedsResult: Paginated<FeedShortInterface> = {
        data: [],
        skip: feeds.skip,
        limit: feeds.limit,
        total: feeds.total,
      };

      // use promise here as we will later get preview from static_resources
      feedsResult.data = await Promise.all(feeds.data.map(async feed => {
        const newFeed: FeedShortInterface = {
          // isFired,
          id: feed.id,
          preview: "https://picsum.photos/375/210",
          viewsCount: feed.viewCount
        };

        return newFeed;
      }));

      return feedsResult;
    }

    // regular feeds

    const feedsResult: Paginated<FeedInterface> = {
      data: [],
      skip: feeds.skip,
      limit: feeds.limit,
      total: feeds.total,
    };

    const loggedInUser = extractLoggedInUserFromParams(params);
    feedsResult.data = await Promise.all(feeds.data.map(async feed => {
      const [user, feedFires ] = await Promise.all([
        userModel.findOne({
          where: {
            id: feed.authorId
          }
        }),
        feedFiresModel.findAndCountAll({
          where: {
            feedId: feed.id
          }
        }),
        // feedBookmarkModel.findAndCountAll({
        //   where: {
        //     authorId: loggedInUser?.userId ?? '',
        //     feedId: feed.id,
        //   }
        // }),
      ]);

      const isFired = loggedInUser?.userId? !!feedFires.rows.find(feedFire => feedFire.authorId === loggedInUser.userId) : false;
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
        fires: feedFires.count,
        isFired,
        isBookmarked,
        id: feed.id,
        preview: "https://picsum.photos/375/210",
        stores: 0,
        title: feed.title,
        video: "",
        viewsCount: feed.viewCount
      };

      return newFeed;
    }));

    return feedsResult;
  }
}
