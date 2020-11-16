import { Dispatch } from 'redux';
import {
  VideoCreationForm,
  VideoUpdateForm,
  videoCreated,
  videoUpdated,
  videoDeleted, locationTypesRetrieved
} from './actions';
import {
  locationCreated,
  locationPatched,
  locationRemoved,
  locationsRetrieved
} from "../location/actions";
import { client } from '../feathers';
import { PublicVideo, videosFetchedError, videosFetchedSuccess } from '../video/actions';
import axios from 'axios';
import { apiUrl } from '../service.common';
import { dispatchAlertError, dispatchAlertSuccess } from '../alert/service';
import {collectionsFetched} from "../scenes/actions";

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
    const locationAdmins = await client.service('location-admin').find();
    const locations = await client.service('location').find({
      query: {
        $sort: {
          name: -1
        }
      }
    });
    dispatch(locationsRetrieved(locations));
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