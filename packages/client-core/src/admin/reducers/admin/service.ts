import { Dispatch } from 'redux'
import {
  VideoCreationForm,
  VideoUpdateForm,
  videoCreated,
  videoUpdated,
  videoDeleted,
  locationTypesRetrieved,
  instancesRetrievedAction,
  instanceRemovedAction,
  instanceRemoved,
  userRoleRetrieved,
  userRoleCreated,
  partyAdminCreated,
  partyRetrievedAction,
  userAdminRemoved,
  userCreated,
  adminUserPatched,
  userRoleUpdated,
  searchedUser,
  fetchedSingleUser,
  refetchSingleUser
} from './actions'

import axios from 'axios'
import { Config } from '@xrengine/common/src/config'
import { client } from '../../../feathers'
import { dispatchAlertSuccess, dispatchAlertError } from '../../../common/reducers/alert/service'
import { PublicVideo, videosFetchedSuccess, videosFetchedError } from '../../../media/components/video/actions'
import {
  locationsRetrieved,
  locationCreated,
  locationPatched,
  locationRemoved
} from '../../../social/reducers/location/actions'
import Store from '../../../store'
import { UserAction } from '../../../user/store/UserAction'
import { collectionsFetched } from '../../../world/reducers/scenes/actions'

const store = Store.store

export function createVideo(data: VideoCreationForm) {
  return async (dispatch: Dispatch, getState: any) => {
    const token = getState().get('auth').get('authUser').accessToken
    try {
      const res = await axios.post(`${Config.publicRuntimeConfig.apiServer}/video`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      })
      const result = res.data
      dispatchAlertSuccess(dispatch, 'Video uploaded')
      dispatch(videoCreated(result))
    } catch (err) {
      dispatchAlertError(dispatch, 'Video upload error: ' + err.response.data.message)
    }
  }
}

export function updateVideo(data: VideoUpdateForm) {
  return (dispatch: Dispatch): any => {
    client
      .service('static-resource')
      .patch(data.id, data)
      .then((updatedVideo) => {
        dispatchAlertSuccess(dispatch, 'Video updated')
        dispatch(videoUpdated(updatedVideo))
      })
  }
}

export function deleteVideo(id: string) {
  return (dispatch: Dispatch): any => {
    client
      .service('static-resource')
      .remove(id)
      .then((removedVideo) => {
        dispatchAlertSuccess(dispatch, 'Video deleted')
        dispatch(videoDeleted(removedVideo))
      })
  }
}

export function fetchAdminVideos() {
  return (dispatch: Dispatch): any => {
    client
      .service('static-resource')
      .find({
        query: {
          $limit: 100,
          mimeType: 'application/dash+xml'
        }
      })
      .then((res: any) => {
        for (const video of res.data) {
          video.metadata = JSON.parse(video.metadata)
        }
        const videos = res.data as PublicVideo[]
        return dispatch(videosFetchedSuccess(videos))
      })
      .catch(() => dispatch(videosFetchedError('Failed to fetch videos')))
  }
}

export function fetchAdminLocations() {
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
    })
    dispatch(locationsRetrieved(locations))
  }
}

export function fetchUsersAsAdmin(offset: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user')
    const skip = getState().get('admin').get('users').get('skip')
    const limit = getState().get('admin').get('users').get('limit')
    try {
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
        })
        dispatch(UserAction.loadedUsers(users))
      }
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function fetchAdminInstances() {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user')
    try {
      if (user.userRole === 'admin') {
        const instances = await client.service('instance').find({
          query: {
            $sort: {
              createdAt: -1
            },
            $skip: getState().get('admin').get('users').get('skip'),
            $limit: getState().get('admin').get('users').get('limit'),
            action: 'admin'
          }
        })
        dispatch(instancesRetrievedAction(instances))
      }
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createLocation(location: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('location').create(location)
      dispatch(locationCreated(result))
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createUser(user: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('user').create(user)
      dispatch(userCreated(result))
    } catch (error) {
      dispatchAlertError(dispatch, error.message)
    }
  }
}

export function patchUser(id: string, user: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('user').patch(id, user)
      dispatch(adminUserPatched(result))
    } catch (error) {
      dispatchAlertError(dispatch, error.message)
    }
  }
}

export function removeUserAdmin(id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('user').remove(id)
    dispatch(userAdminRemoved(result))
  }
}

export function removeInstance(id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('instance').patch(id, {
      ended: true
    })
    dispatch(instanceRemoved(result))
  }
}

export function patchLocation(id: string, location: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('location').patch(id, location)
      dispatch(locationPatched(result))
    } catch (err) {
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function removeLocation(id: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('location').remove(id)
    dispatch(locationRemoved(result))
  }
}

export function fetchAdminScenes() {
  return async (dispatch: Dispatch): Promise<any> => {
    const scenes = await client.service('collection').find({
      query: {
        $limit: 100,
        $sort: {
          name: -1
        }
      }
    })
    dispatch(collectionsFetched(scenes))
  }
}

export function fetchLocationTypes() {
  return async (dispatch: Dispatch): Promise<any> => {
    const locationTypes = await client.service('location-type').find()
    dispatch(locationTypesRetrieved(locationTypes))
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance').on('removed', (params) => {
    store.dispatch(instanceRemovedAction(params.instance))
  })
}

export const fetchUserRole = () => {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const userRole = await client.service('user-role').find()
      dispatch(userRoleRetrieved(userRole))
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const createUserRoleAction = (data) => {
  return async (dispatch: Dispatch): Promise<any> => {
    const result = await client.service('user-role').create(data)
    dispatch(userRoleCreated(result))
  }
}

export const createAdminParty = (data) => {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('party').create(data)
      dispatch(partyAdminCreated(result))
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const fetchAdminParty = () => {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user')
    try {
      if (user.userRole === 'admin') {
        const parties = await client.service('party').find({
          query: {
            $sort: {
              createdAt: -1
            },
            $skip: getState().get('admin').get('users').get('skip'),
            $limit: getState().get('admin').get('users').get('limit')
          }
        })
        dispatch(partyRetrievedAction(parties))
      }
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const updateUserRole = (id: string, role: string) => {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const userRole = await client.service('user').patch(id, { userRole: role })
      dispatch(userRoleUpdated(userRole))
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const searchUserAction = (data: any, offset: string) => {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      const user = getState().get('auth').get('user')
      const skip = getState().get('admin').get('users').get('skip')
      const limit = getState().get('admin').get('users').get('limit')
      const result = await client.service('user').find({
        query: {
          $sort: {
            name: 1
          },
          $skip: skip || 0,
          $limit: limit,
          action: 'search',
          data
        }
      })
      dispatch(searchedUser(result))
    } catch (err) {
      console.error(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export const fetchSingleUserAdmin = (id: string) => {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('user').get(id)
      dispatch(fetchedSingleUser(result))
    } catch (error) {
      console.error(error)
      dispatchAlertError(dispatch, error.message)
    }
  }
}

export const refetchSingleUserAdmin = () => {
  console.log('refetchSingleUserAdmin')
  return async (dispatch: Dispatch): Promise<any> => dispatch(refetchSingleUser())
}
