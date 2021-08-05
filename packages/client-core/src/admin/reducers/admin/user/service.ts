import { Dispatch } from 'redux'
import {
  userRoleRetrieved,
  userRoleCreated,
  userAdminRemoved,
  userCreated,
  userPatched,
  userRoleUpdated,
  searchedUser,
  fetchedSIngleUser,
  fetchedStaticResource
} from './actions'
import { client } from '../../../../feathers'
import { loadedUsers } from './actions'
import { dispatchAlertError } from '../../../../common/reducers/alert/service'

export function fetchUsersAsAdmin(offset: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const user = getState().get('auth').get('user')
    console.log(user)

    const skip = getState().get('adminUser').get('users').get('skip')
    const limit = getState().get('adminUser').get('users').get('limit')
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
        dispatch(loadedUsers(users))
      }
    } catch (err) {
      console.error(err)
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
      console.error(error)
      dispatchAlertError(dispatch, error.message)
    }
  }
}

export function patchUser(id: string, user: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('user').patch(id, user)
      dispatch(userPatched(result))
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
      const skip = getState().get('adminUser').get('users').get('skip')
      const limit = getState().get('adminUser').get('users').get('limit')
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
      dispatch(fetchedSIngleUser(result))
    } catch (error) {
      console.error(error)
      dispatchAlertError(dispatch, error.message)
    }
  }
}

export const fetchStaticResource = () => {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const result = await client.service('static-resource').find({
        query: {
          staticResourceType: 'avatar'
        }
      })
      dispatch(fetchedStaticResource(result))
    } catch (error) {
      console.error(error)
    }
  }
}
