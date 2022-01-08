import { HookContext } from '@feathersjs/feathers'

import logger from '../logger'

export async function addFeedFire(context: any): Promise<HookContext> {
  try {
    const { result, params } = context
    const viewer = await context.app.service('feed').get(result.dataValues.feedId, params)
    await context.app.service('notifications').create({
      feedId: result.dataValues.feedId,
      creatorAuthorId: result.dataValues.creatorId,
      creatorViewerId: viewer.creator.id,
      type: 'feed-fire'
    })
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER FEED FIRE ERROR')
    logger.error(err)
    return null!
  }
}

export async function removeFeedFire(context: any): Promise<HookContext> {
  try {
    const { result, params } = context
    const notification = await context.app
      .service('notifications')
      .find({ ...params, action: 'getNotificationId', feedId: result, type: 'feed-fire' })
    await context.app.service('notifications').remove(notification.id)
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER REMOVE FEED FIRE ERROR')
    logger.error(err)
    return null!
  }
}

export async function addFeedBookmark(context: any): Promise<HookContext> {
  try {
    const { result, params } = context
    const viewer = await context.app.service('feed').get(result.dataValues.feedId, params)
    await context.app.service('notifications').create({
      feedId: result.dataValues.feedId,
      creatorAuthorId: result.dataValues.creatorId,
      creatorViewerId: viewer.creator.id,
      type: 'feed-bookmark'
    })
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER FEED FIRE ERROR')
    logger.error(err)
    return null!
  }
}

export async function removeFeedBookmark(context: any): Promise<HookContext> {
  try {
    const { result, params } = context
    const notification = await context.app
      .service('notifications')
      .find({ ...params, action: 'getNotificationId', feedId: result, type: 'feed-bookmark' })
    await context.app.service('notifications').remove(notification.id)
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER REMOVE FEED FIRE ERROR')
    logger.error(err)
    return null!
  }
}

export async function addFeedComment(context: any): Promise<HookContext> {
  try {
    const { result, params } = context
    const viewer = await context.app.service('feed').get(result.feedId, params)
    await context.app.service('notifications').create({
      feedId: result.feedId,
      creatorAuthorId: result.creator.id,
      creatorViewerId: viewer.creator.id,
      type: 'comment',
      commentId: result.id
    })
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER ADD COMMENT TO FEED ERROR')
    logger.error(err)
    return null!
  }
}

export async function addFeedCommentFire(context: any): Promise<HookContext> {
  try {
    const { result, params } = context
    const comment = await context.app.service('comments').get(result.dataValues.commentId, params)
    const viewer = await context.app.service('feed').get(comment.feedId, params)
    await context.app.service('notifications').create({
      feedId: viewer.id,
      creatorAuthorId: result.dataValues.creatorId,
      creatorViewerId: comment.creatorId,
      type: 'comment-fire',
      commentId: comment.id
    })
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER ADD FIRE TO COMMENT TO FEED ERROR')
    logger.error(err)
    return null!
  }
}

export async function removeFeedCommentFire(context: any): Promise<HookContext> {
  try {
    const { result, params } = context
    const comment = await context.app.service('comments').get(result.commentId, params)
    const notification = await context.app.service('notifications').find({
      ...params,
      action: 'getNotificationId',
      feedId: comment.feedId,
      commentId: comment.id,
      creatorAuthorId: result.creatorAuthorId,
      type: 'comment-fire'
    })
    await context.app.service('notifications').remove(notification.id)
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER REMOVE FEED FIRE ERROR')
    logger.error(err)
    return null!
  }
}

export async function addFollowCreator(context: any): Promise<HookContext> {
  try {
    const { result } = context
    await context.app.service('notifications').create({
      creatorAuthorId: result.followerId,
      creatorViewerId: result.creatorId,
      type: 'follow'
    })
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER FOLLOW CREATOR ERROR')
    logger.error(err)
    return null!
  }
}

export async function addBlockCreator(context: any): Promise<HookContext> {
  try {
    const { result } = context
    await context.app.service('notifications').create({
      creatorAuthorId: result.blockedId,
      creatorViewerId: result.creatorId,
      type: 'block'
    })
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER FOLLOW CREATOR ERROR')
    logger.error(err)
    return null!
  }
}

export async function removeFollowCreator(context: any): Promise<HookContext> {
  try {
    const { result } = context
    await context.app.service('notifications').create({
      creatorAuthorId: result.creatorId,
      creatorViewerId: result.followedCreatorId,
      type: 'unfollow'
    })
    return context
  } catch (err) {
    logger.error('NOTIFICATION AFTER UNFOLLOW CREATOR ERROR')
    logger.error(err)
    return null!
  }
}
