import { Dispatch } from 'redux';
import { client } from '../feathers';
import {dispatchAlertSuccess} from '../alert/service';
import {
  sentInvite,
} from './actions';

export function uploadAvatars (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    data.each(async (data) => {
      const existingFiles = await client.service('static-resource').find({
        query: {
          name: data.name,
        }
      });
      const existingThumbnail = existingFiles.data.find(file => file.staticResourceType === 'user-thumbnail');
      const existingModel = existingFiles.data.find(file => file.staticResourceType === 'avatar');

      if (existingThumbnail == null) {
        await client.service('static-resource').create({
          name: data.name,
          url: data.thumbnail,
          staticResourceType: 'user-thumbnail',
          key: `avatars/${data.name}.png`
        });
      } else {
        await client.service('static-resource').patch(existingThumbnail.id, {
          name: data.name,
          url: data.thumbnail,
          key: `avatars/${data.name}.png`
        });
      }

      if (existingModel == null) {
        await client.service('static-resource').create({
          name: data.name,
          url: data.glb,
          staticResourceType: 'avatar',
          key: `avatars/${data.name}.png`
        });
      } else {
        await client.service('static-resource').patch(existingThumbnail.id, {
          name: data.name,
          url: data.glb,
          key: `avatars/${data.name}.png`
        });
      }
    });
  }
}

export function uploadScenes (data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    data.each(async (data) => {
    });
  }
}