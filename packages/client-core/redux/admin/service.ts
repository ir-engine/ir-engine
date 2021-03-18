import { Dispatch } from 'redux';
import {
  VideoCreationForm,
  VideoUpdateForm,
  videoCreated,
  videoUpdated,
  videoDeleted,
  locationTypesRetrieved,
  instancesRetrievedAction,
  instanceRemovedAction,
  instanceCreated,
  instanceRemoved,
  instancePatched
} from './actions';
import {
  locationCreated,
  locationPatched,
  locationRemoved,
  locationsRetrieved,
} from "../location/actions";
import {
  loadedUsers,
  userCreated,
  userRemoved,
  userPatched,
} from '../user/actions';

import { LOADED_USERS } from "../actions"

import { client } from '../feathers';
import { PublicVideo, videosFetchedError, videosFetchedSuccess } from '../video/actions';
import axios from 'axios';
import { apiUrl } from '../service.common';
import { dispatchAlertError, dispatchAlertSuccess } from '../alert/service';
import {collectionsFetched} from "../scenes/actions";
import store from "../store";


export function createVideo (data: VideoCreationForm) {
  return async (dispatch: Dispatch, getState: any) => {
    const token = getState().get('auth').get('authUser').accessToken;
    try {
      const res = await axios.post(`${apiUrl}/video`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      });
      const result = res.data;
      dispatchAlertSuccess(dispatch, 'Video uploaded');
      dispatch(videoCreated(result));
    } catch (err) {
      console.log(err);
      dispatchAlertError(dispatch, 'Video upload error: ' + err.response.data.message);
    }
  };
}

export function updateVideo(data: VideoUpdateForm) {
  return (dispatch: Dispatch): any => {
    client.service('static-resource').patch(data.id, data)
      .then((updatedVideo) => {
        dispatchAlertSuccess(dispatch, 'Video updated');
        dispatch(videoUpdated(updatedVideo));
      });
  };
}

export function deleteVideo(id: string) {
  return (dispatch: Dispatch): any => {
    client.service('static-resource').remove(id)
      .then((removedVideo) => {
        dispatchAlertSuccess(dispatch, 'Video deleted');
        dispatch(videoDeleted(removedVideo));
      });
  };
}

export function fetchAdminVideos () {
  return (dispatch: Dispatch): any => {
    client.service('static-resource').find({
      query: {
        $limit: 100,
        mimeType: 'application/dash+xml'
      }
    })
      .then((res: any) => {
        for (const video of res.data) {
          video.metadata = JSON.parse(video.metadata);
        }
        const videos = res.data as PublicVideo[];
        return dispatch(videosFetchedSuccess(videos));
      })
      .catch(() => dispatch(videosFetchedError('Failed to fetch videos')));
  };
}

export function fetchAdminLocations () {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const locations = await client.service('location').find({
      query: {
        $sort: {
          name: 1
        },
        $skip: getState().get('admin').get('locations').get('skip'),
        $limit: getState().get('admin').get('locations').get('limit'),
        adminnedLocations: true
      }
    });
    dispatch(locationsRetrieved(locations));
  };
}

export function fetchUsersAsAdmin (offset: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user');
    const skip = getState().get('admin').get('users').get('skip');
    const limit = getState().get('admin').get('users').get('limit');
    
    if (user.userRole === 'admin') {
      const users = await client.service('user').find({
        query: {
          $sort: {
            name: 1
          },
          $skip: offset === 'decrement' ? skip - limit : offset === 'increment' ? skip + limit : skip,
          $limit: limit,
          action: 'admin'
        }
      });
      dispatch(loadedUsers(users));
    }
  };
}

export function fetchAdminInstances () {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user');
    if (user.userRole === 'admin') {
      const instances = await client.service('instance').find({
        $sort: {
          createdAt: -1
        },
        $skip: getState().get('admin').get('users').get('skip'),
        $limit: getState().get('admin').get('users').get('limit'),
        action: 'admin'
      });
      dispatch(instancesRetrievedAction(instances));
    }
  };
}

export function createLocation (location: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('location').create(location);
      dispatch(locationCreated(result));
    } catch(err) {
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function createUser (user: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('user').create(user);
      dispatch(userCreated(result))
    } catch (error) {
      dispatchAlertError(dispatch, error.message);
    }
  }
}

export function patchUser (id: string, user: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('user').patch(id, user);
      dispatch(userPatched(result));
    } catch (error) {
      console.log(error);
      dispatchAlertError(dispatch, error.message);
    }
  }
}


export function removeUser (id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('user').remove(id);
    dispatch(userRemoved(result))
  }
}

export function createInstance (instance: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('instance').create(instance);
      dispatch(instanceCreated(result));
    } catch (error) {
      dispatchAlertError(dispatch, error.message);
    }
  }
}

export function patchInstance (id: string, instance) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('instance').patch(id, instance);
      dispatch(instancePatched(result));
    } catch (error) {
      
    }
  }
}

export function removeInstance (id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('instance').remove(id);
    dispatch(instanceRemoved(result));
  }
}

export function patchLocation (id: string, location: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('location').patch(id, location);
      dispatch(locationPatched(result));
    } catch(err) {
      console.log(err);
      dispatchAlertError(dispatch, err.message);
    }
  };
}

export function removeLocation (id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('location').remove(id);
    dispatch(locationRemoved(result));
  };
}

export function fetchAdminScenes () {
  return async(dispatch: Dispatch): Promise<any> => {
    const scenes = await client.service('collection').find({
      query: {
        $limit: 100,
        $sort: {
          name: -1
        }
      }
    });
    dispatch(collectionsFetched(scenes));
  };
}

export function fetchLocationTypes () {
  return async(dispatch: Dispatch): Promise<any> => {
    const locationTypes = await client.service('location-type').find();
    dispatch(locationTypesRetrieved(locationTypes));
  };
}

client.service('instance').on('removed', (params) => {
  store.dispatch(instanceRemovedAction(params.instance));
});