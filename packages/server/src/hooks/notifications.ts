import { HookContext } from '@feathersjs/feathers';
import logger from '../app/logger';

export async function addFeedFire (context: any): Promise<HookContext> {
    try {
      const { result, params } = context;
      const viewer = await context.app.service('feed').get(result.dataValues.feedId, params);
      await context.app.service('notifications').create({
        feedId: result.dataValues.feedId,
        creatorAuthorId: result.dataValues.creatorId,
        creatorViewerId: viewer.creator.id,
        type:'feed-fire'
      });
      return context;
    } catch (err) {
      logger.error('NOTIFICATION AFTER FEED FIRE ERROR');
      logger.error(err);
    }
}

export async function removeFeedFire (context: any): Promise<HookContext> {
  try {
    const { result, params } = context;
    const notification = await context.app.service('notifications').find({...params, action: 'getNotificationId', feedId:result, type: 'feed-fire'});
    await context.app.service('notifications').remove(notification.id);    
    return context;
  } catch (err) {
    logger.error('NOTIFICATION AFTER REMOVE FEED FIRE ERROR');
    logger.error(err);
  }
}

export async function addFeedBookmark (context: any): Promise<HookContext> {
  try {
    const { result, params } = context;
    const viewer = await context.app.service('feed').get(result.dataValues.feedId, params);
    await context.app.service('notifications').create({
      feedId: result.dataValues.feedId,
      creatorAuthorId: result.dataValues.creatorId,
      creatorViewerId: viewer.creator.id,
      type:'feed-bookmark'
    });
    return context;
  } catch (err) {
    logger.error('NOTIFICATION AFTER FEED FIRE ERROR');
    logger.error(err);
  }
}

export async function removeFeedBookmark (context: any): Promise<HookContext> {
try {
  const { result, params } = context;
  const notification = await context.app.service('notifications').find({...params, action: 'getNotificationId', feedId:result, type: 'feed-bookmark'});
  await context.app.service('notifications').remove(notification.id);    
  return context;
} catch (err) {
  logger.error('NOTIFICATION AFTER REMOVE FEED FIRE ERROR');
  logger.error(err);
}
}