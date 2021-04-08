import { random } from 'lodash';
import { Dispatch } from 'redux';
import { dispatchAlertError } from '../../../common/reducers/alert/service';
import { client } from '../../../feathers';
import Api from '../../../world/components/editor/Api';
import {
  fetchingFeeds,
  feedsRetrieved,
  feedRetrieved,
  feedsFeaturedRetrieved,
  addFeedView,
  addFeed,
  feedsCreatorRetrieved,
  feedsBookmarkRetrieved,
  feedsMyFeaturedRetrieved,
  feedAsFeatured,
  feedNotFeatured,
  feedsAdminRetrieved,
  updateFeedInList
} from './actions';

export function getFeeds(type: string, id?: string, limit?: number) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(fetchingFeeds());
      const feedsResults = [];
      if (type && (type === 'featured' || type === 'featuredGuest')) {
        const feedsResults = await client.service('feed').find({
          query: {
            action: type
          }
        });
        dispatch(feedsFeaturedRetrieved(feedsResults.data));
      } else if (type && type === 'creator') {
        const feedsResults = await client.service('feed').find({
          query: {
            action: 'creator',
            creatorId: id
          }
        });
        dispatch(feedsCreatorRetrieved(feedsResults.data));
      } else if (type && type === 'bookmark') {
        const feedsResults = await client.service('feed').find({
          query: {
            action: 'bookmark',
            creatorId: id
          }
        });
        dispatch(feedsBookmarkRetrieved(feedsResults.data));
      } else if (type && type === 'myFeatured') {
        const feedsResults = await client.service('feed').find({
          query: {
            action: 'myFeatured',
            creatorId: id
          }
        });
        dispatch(feedsMyFeaturedRetrieved(feedsResults.data));
      } else if (type && type === 'admin') {
        const feedsResults = await client.service('feed').find({
          query: {
            action: 'admin'
          }
        });
        dispatch(feedsAdminRetrieved(feedsResults.data));
      } else {
        const feedsResults = await client.service('feed').find({ query: {action: type || ''} });
        dispatch(feedsRetrieved(feedsResults.data));
      }
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function getFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingFeeds());
      const feed = await client.service('feed').get(feedId);
      dispatch(feedRetrieved(feed));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function addViewToFeed(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed').patch(feedId, { viewsCount: feedId });
      dispatch(addFeedView(feedId));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function createFeed({ title, description, video, preview }: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const api = new Api();
      const storedVideo = await api.upload(video, null);
      const storedPreview = await api.upload(preview, null);
      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      if (storedVideo && storedPreview) {
        //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
        const feed = await client.service('feed').create({ title, description, videoId: storedVideo.file_id, previewId: storedPreview.file_id });
        dispatch(addFeed(feed));
      }
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function updateFeedAsAdmin(feedId: string, feed: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      if (feed.video) {
        const api = new Api();
        const storedVideo = await api.upload(feed.video, null);
        //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
        feed.videoId = storedVideo.file_id;
        delete feed.video;
      }
      if (feed.preview) {
        const api = new Api();
        const storedPreview = await api.upload(feed.preview, null);
        //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
        feed.previewId = storedPreview.file_id;
        delete feed.preview;
      }
      //@ts-ignore error that this vars are void bacause upload is defines as voin funtion
      const updatedFeed = await client.service('feed').patch(feedId, feed);
      dispatch(updateFeedInList(updatedFeed));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function setFeedAsFeatured(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed').patch(feedId, { featured: 1 });
      dispatch(feedAsFeatured(feedId));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function setFeedNotFeatured(feedId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('feed').patch(feedId, { featured: 0 });
      dispatch(feedNotFeatured(feedId));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}