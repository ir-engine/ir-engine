import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Paginated, Params } from "@feathersjs/feathers";
import { QueryTypes } from "sequelize";
import { Feed as IFeed, FeedShord as IFeedShort, FeedDatabaseRow } from '../../../../common/interfaces/Feed';
import { extractLoggedInUserFromParams } from "../auth-management/auth-management.utils";

/**
 * A class for ARC Feed service
 */
export class Feed extends Service {
  app: Application

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
      feed_fires:feedFiresModel,
      user:userModel
    } = this.app.get('sequelizeClient').models;

    const feeds = await super.find({
      skip,
      limit
    }) as Paginated<FeedDatabaseRow>;

    if (action === 'featured') {
      const feedsResult: Paginated<IFeedShort> = {
        data: [],
        skip: feeds.skip,
        limit: feeds.limit,
        total: feeds.total,
      };

      // use promise here as we will later get preview from static_resources
      feedsResult.data = await Promise.all(feeds.data.map(async feed => {
        const newFeed: IFeedShort = {
          // isFired,
          id: feed.id,
          preview: "https://picsum.photos/375/210",
          viewsCount: feed.viewsCount
        };

        return newFeed;
      }));

      return feedsResult;
    }

    // regular feeds

    const feedsResult: Paginated<IFeed> = {
      data: [],
      skip: feeds.skip,
      limit: feeds.limit,
      total: feeds.total,
    };

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
      ]);

      // const loggedInUser = extractLoggedInUserFromParams(params);
      // const isFired = loggedInUser?.userId? !!feedFires.rows.find(ff => ff.authorId === loggedInUser.userId) : false;

      const newFeed: IFeed = {
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
        // isFired,
        id: feed.id,
        preview: "https://picsum.photos/375/210",
        stores: 0,
        title: feed.title,
        video: "",
        viewsCount: feed.viewsCount
      };

      return newFeed;
    }));

    return feedsResult;
  }

  getFiresCount(feedId: number): Promise<number> {
    return this.app
      .get('sequelizeClient')
      .models.feed_fires
      .count({
        where: {
          feedId
        }
      });

    // const countQuery = `SELECT COUNT(id) FROM \`user\` WHERE ${where}`;
    // const dataQuery = `SELECT * FROM \`user\` WHERE ${where} LIMIT :skip, :limit`;
    //
    // return this.app.get('sequelizeClient').query(countQuery,
    //   {
    //     type: QueryTypes.SELECT,
    //     raw: true,
    //     replacements: {
    //       userId,
    //       search: `%${search}%`
    //     }
    //   });
  }
}
