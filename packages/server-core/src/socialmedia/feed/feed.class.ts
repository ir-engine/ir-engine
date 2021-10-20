/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'
import { Feed as FeedInterface } from '@xrengine/common/src/interfaces/Feed'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'
import { getCreatorByUserId } from '../util/getCreator'
/**
 * A class for Social Feed service
 */
export class Feed extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * @function find it is used to find specific users
   *
   * @param params
   * @returns {@Array} of found users
   */

  async find(params: Params): Promise<any> {
    const action = params.query?.action
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 100
    console.log('action', action)

    const queryParamsReplacements = {
      skip,
      limit
    } as any

    //All Feeds as Admin
    if (action === 'admin') {
      const dataQuery = `SELECT feed.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, 
      sr2.url as previewUrl, sr1.url as videoUrl, sr2.mimeType as previewType, sr1.mimeType as videoType, sr3.url as avatar, COUNT(ff.id) as fires, COUNT(fl.id) as likes, COUNT(fb.id) as bookmarks 
        FROM \`feed\` as feed
        JOIN \`creator\` as creator ON creator.id=feed.creatorId
        JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
        JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
        LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
        LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id
        LEFT JOIN \`feed_likes\` as fl ON fl.feedId=feed.id
        LEFT JOIN \`feed_bookmark\` as fb ON fb.feedId=feed.id
        WHERE 1
        GROUP BY feed.id
        ORDER BY feed.createdAt DESC    
        LIMIT :skip, :limit `

      const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { ...queryParamsReplacements }
      })

      // const test = await (this.app.service('feed') as any).Model.findAll({
      //   include: [
      //     {
      //       model: (this.app.service('static_resource') as any).Model,
      //       as: "sr1",
      //       attributes: [],
      //       required: false
      //     },
      //     {
      //       model: (this.app.service('creator') as any).Model,
      //       required: false
      //     }
      //   ],
      //   raw: true,
      //   nest: true
      // })
      // console.log(test);

      console.log(feeds)
      return {
        data: feeds,
        skip,
        limit,
        total: feeds.count
      }
    }
    const loggedInUser = extractLoggedInUserFromParams(params)
    const creatorId = params.query?.creatorId
      ? params.query.creatorId
      : await getCreatorByUserId(loggedInUser?.userId, this.app.get('sequelizeClient'))

    //Featured menu item for Guest
    //Featured menu item
    if (action === 'featuredGuest' || action === 'featured') {
      const dataQuery = `SELECT feed.id, feed.viewsCount, sr.url as previewUrl, sr.mimeType as previewType, feed.description as description, feed.title as title, COUNT(DISTINCT ff.id) as fires, COUNT(DISTINCT fl.id) as likes, isf.id as fired
        FROM \`feed\` as feed
       JOIN static_resource as sr ON sr.id=feed.previewId
       LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id
       LEFT JOIN \`feed_likes\` as fl ON fl.feedId=feed.id
       LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.creatorId='${creatorId}'
       WHERE feed.creatorId NOT IN (select blockedId from block_creator where 
         creatorId = '${creatorId}')
         AND feed.creatorId NOT IN (select creatorId from block_creator where blockedId = '${creatorId}')
         GROUP BY feed.id`

      const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })
      console.log(feeds)
      return {
        data: feeds,
        skip,
        limit,
        total: feeds.count
      }
    }

    if (action === 'creator') {
      const dataQuery = `SELECT feed.id, feed.creatorId, feed.featured, feed.viewsCount, sr.url as previewUrl, sr.mimeType as previewType, feed.description as description, feed.title as title
        FROM \`feed\` as feed
        JOIN \`static_resource\` as sr ON sr.id=feed.previewId
        WHERE feed.creatorId=:creatorId
        ORDER BY feed.createdAt DESC    
        LIMIT :skip, :limit `

      queryParamsReplacements.creatorId = params.query?.creatorId ? params.query.creatorId : creatorId
      const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })

      return {
        data: feeds,
        skip,
        limit,
        total: feeds.count
      }
    }

    if (action === 'myFeatured') {
      const dataQuery = `SELECT feed.id, feed.creatorId, feed.featured,  feed.viewsCount, sr.url as previewUrl, sr.mimeType as previewType, feed.description as description, feed.title as title 
         FROM \`feed\` as feed
         JOIN \`static_resource\` as sr ON sr.id=feed.previewId
         WHERE feed.creatorId=:creatorId AND feed.featured=1
         ORDER BY feed.createdAt DESC    
         LIMIT :skip, :limit `
      queryParamsReplacements.creatorId = creatorId
      const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })

      return {
        data: feeds,
        skip,
        limit,
        total: feeds.count
      }
    }

    //
    if (action === 'bookmark') {
      const dataQuery = `SELECT feed.id, feed.viewsCount, sr.url as previewUrl, sr.mimeType as previewType 
         FROM \`feed\` as feed
         JOIN \`static_resource\` as sr ON sr.id=feed.previewId
         JOIN \`feed_bookmark\` as fb ON fb.feedId=feed.id
         WHERE fb.creatorId=:creatorId
         ORDER BY feed.createdAt DESC    
         LIMIT :skip, :limit `

      queryParamsReplacements.creatorId = creatorId
      const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })

      return {
        data: feeds,
        skip,
        limit,
        total: feeds.count
      }
    }

    //change this to fired!!!!!!
    if (action === 'fired') {
      const dataQuery = `SELECT feed.id, feed.viewsCount, sr.url as previewUrl, sr.mimeType as previewType, feed.description as description, feed.title as title, isf.id as fired 
         FROM \`feed\` as feed
         JOIN \`static_resource\` as sr ON sr.id=feed.previewId
         JOIN \`feed_fires\` as fb ON fb.feedId=feed.id
         LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.creatorId=:creatorId
         WHERE fb.creatorId=:creatorId
         GROUP BY feed.id
         ORDER BY feed.createdAt DESC    
         LIMIT :skip, :limit `

      queryParamsReplacements.creatorId = creatorId
      const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })

      return {
        data: feeds,
        skip,
        limit,
        total: feeds.count
      }
    }

    //don't needed anymore, remove this after change TheFeed by filling it on Admin Panel
    if (action === 'theFeedGuest') {
      const select = `SELECT feed.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, creator.verified as creatorVerified, 

       sr3.url as avatar, COUNT(ff.id) as fires, COUNT(fl.id) as likes, sr1.url as videoUrl, sr2.url as previewUrl, sr2.mimeType as previewType, sr1.mimeType as videoType `
      const from = ` FROM \`feed\` as feed`
      const join = ` JOIN \`creator\` as creator ON creator.id=feed.creatorId
                     LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
                     LEFT JOIN \`feed_likes\` as ff ON fl.feedId=feed.id
                     JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
                     JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
                     LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
                     `
      const where = ` WHERE 1`
      const order = ` GROUP BY feed.id
       ORDER BY feed.createdAt DESC    
       LIMIT :skip, :limit `

      const dataQuery = select + from + join + where + order
      const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: queryParamsReplacements
      })

      const data = feeds.map((feed) => {
        const newFeed: FeedInterface = {
          creator: {
            id: feed.creatorId,
            avatar: feed.avatar,
            name: feed.creatorName,
            username: feed.creatorUserName,
            verified: !!+feed.creatorVerified
          },
          description: feed.description,
          fires: feed.fires,
          isFired: false,
          likes: feed.likes,
          isLiked: false,
          isBookmarked: false,
          id: feed.id,
          videoUrl: feed.videoUrl,
          previewUrl: feed.previewUrl,
          title: feed.title,
          viewsCount: feed.viewsCount
        }
        return newFeed
      })

      const feedsResult = {
        data,
        skip: skip,
        limit: limit,
        total: feeds.length
      }

      return feedsResult
    }

    // TheFeed menu item - just for followed creatos!!!!!
    let select = `SELECT feed.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, creator.verified as creatorVerified, 
    sr3.url as avatar, COUNT(ff.id) as fires, COUNT(fl.id) as likes, sr1.url as videoUrl, sr2.url as previewUrl, sr2.mimeType as previewType, sr1.mimeType as videoType, fc.id as follow_id, fc.creatorId as fc_creatorId, 
    fc.followerId as fc_follower_id  `
    const from = ` FROM \`feed\` as feed`
    let join = ` JOIN \`creator\` as creator ON creator.id=feed.creatorId
                  LEFT JOIN \`follow_creator\` as fc ON fc.creatorId=feed.creatorId 
                  LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
                  LEFT JOIN \`feed_likes\` as fl ON fl.feedId=feed.id 
                  JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
                  JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
                  LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
                  `

    const where = ` WHERE fc.followerId=:creatorId OR feed.creatorId=:creatorId`
    const order = ` GROUP BY feed.id
     ORDER BY feed.createdAt DESC    
     LIMIT :skip, :limit `

    if (creatorId) {
      select += ` , isf.id as fired, isl.id as liked, isb.id as bookmarked `
      join += ` LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.creatorId=:creatorId
                LEFT JOIN \`feed_likes\` as isl ON isl.feedId=feed.id  AND isl.creatorId=:creatorId
                LEFT JOIN \`feed_bookmark\` as isb ON isb.feedId=feed.id  AND isb.creatorId=:creatorId`

      queryParamsReplacements.creatorId = creatorId
    }

    const dataQuery = select + from + join + where + order
    const feeds = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })

    const data = feeds.map((feed) => {
      const newFeed: FeedInterface = {
        creator: {
          id: feed.creatorId,
          avatar: feed.avatar,
          name: feed.creatorName,
          username: feed.creatorUserName,
          verified: !!+feed.creatorVerified
        },
        description: feed.description,
        fires: feed.fires,
        isFired: feed.fired ? true : false,
        likes: feed.likes,
        isLiked: feed.liked ? true : false,
        isBookmarked: feed.bookmarked ? true : false,
        id: feed.id,
        videoUrl: feed.videoUrl,
        previewUrl: feed.previewUrl,
        title: feed.title,
        viewsCount: feed.viewsCount
      }
      return newFeed
    })

    const feedsResult = {
      data,
      skip: skip,
      limit: limit,
      total: feeds.length
    }

    return feedsResult
  }

  /**
   * A function which is used to find specific project
   *
   * @param id of single feed
   * @param params contains current user
   * @returns {@Object} contains specific feed
   * @author Vykliuk Tetiana
   */
  async get(id: Id, params?: Params): Promise<any> {
    let select = `SELECT feed.*, creator.id as creatorId, creator.name as creatorName, creator.username as creatorUserName, sr3.url as avatar, 
      creator.verified as creatorVerified, COUNT(ff.id) as fires,  COUNT(fl.id) as likes, sr1.url as videoUrl, sr2.url as previewUrl, sr2.mimeType as previewType, sr1.mimeType as videoType `
    const from = ` FROM \`feed\` as feed`
    let join = ` JOIN \`creator\` as creator ON creator.id=feed.creatorId
                    LEFT JOIN \`feed_fires\` as ff ON ff.feedId=feed.id 
                    LEFT JOIN \`feed_likes\` as fl ON fl.feedId=feed.id 
                    JOIN \`static_resource\` as sr1 ON sr1.id=feed.videoId
                    JOIN \`static_resource\` as sr2 ON sr2.id=feed.previewId
                    LEFT JOIN \`static_resource\` as sr3 ON sr3.id=creator.avatarId
                    `

    const where = ` WHERE feed.id=:id`

    const queryParamsReplacements = {
      id
    } as any

    const creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )

    if (creatorId) {
      select += ` , isf.id as fired, isl.id as liked, isb.id as bookmarked `
      join += ` LEFT JOIN \`feed_fires\` as isf ON isf.feedId=feed.id  AND isf.creatorId=:creatorId
                LEFT JOIN \`feed_likes\` as isl ON isl.feedId=feed.id  AND isl.creatorId=:creatorId
                  LEFT JOIN \`feed_bookmark\` as isb ON isb.feedId=feed.id  AND isb.creatorId=:creatorId`

      queryParamsReplacements.creatorId = creatorId
    }

    const dataQuery = select + from + join + where
    const [feed] = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: queryParamsReplacements
    })

    const newFeed: FeedInterface = {
      creator: {
        id: feed.creatorId,
        avatar: feed.avatar,
        name: feed.creatorName,
        username: feed.creatorUserName,
        verified: !!+feed.creatorVerified
      },
      description: feed.description,
      fires: feed.fires,
      isFired: feed.fired ? true : false,
      likes: feed.likes,
      isLiked: feed.liked ? true : false,
      isBookmarked: feed.bookmarked ? true : false,
      id: feed.id,
      videoUrl: feed.videoUrl,
      previewUrl: feed.previewUrl,
      title: feed.title,
      viewsCount: feed.viewsCount,
      previewType: feed.previewType,
      videoType: feed.videoType
    }
    return newFeed
  }

  async create(data: any, params?: Params): Promise<any> {
    const { feed: feedModel } = this.app.get('sequelizeClient').models
    data.creatorId = await getCreatorByUserId(
      extractLoggedInUserFromParams(params)?.userId,
      this.app.get('sequelizeClient')
    )
    const newFeed = await feedModel.create(data)
    return newFeed
  }

  /**
   * A function which is used to update viewsCount field of feed
   *
   * @param id of feed to update
   * @param params
   * @returns updated feed
   * @author
   */
  async patch(id: string, data?: any, params?: Params): Promise<any> {
    const { feed: feedModel } = this.app.get('sequelizeClient').models
    let result = null
    if (data.viewsCount) {
      const feedItem = await feedModel.findOne({ where: { id: id } })
      if (!feedItem) {
        return Promise.reject(new BadRequest('Could not update feed. Feed not found! '))
      }
      result = await super.patch(feedItem.id, {
        viewsCount: (feedItem.viewsCount as number) + 1
      })
    } else {
      result = await super.patch(id, data)
    }
    return result
  }
}
