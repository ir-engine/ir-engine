import { Dispatch } from 'redux'
import { UserAction } from './UserActions'
import { client } from '../../../../feathers'
import { AlertService } from '../../../../common/reducers/alert/AlertService'
import { accessUserState } from './UserState'

export const UserService = {
  fetchUsersAsAdmin: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch): Promise<any> => {
      const userState = accessUserState()
      const skip = userState.users.skip.value
      const limit = userState.users.limit.value
      try {
        if (userState.userRole.userRole.findIndex((r) => r.role.value === 'admin') !== -1) {
          const users = await client.service('user').find({
            query: {
              $sort: {
                name: 1
              },
              $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
              $limit: limit,
              action: 'admin'
            }
          })
          dispatch(UserAction.loadedUsers(users))
        }
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  createUser: (user: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('user').create(user)
        dispatch(UserAction.userCreated(result))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  },
  patchUser: (id: string, user: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('user').patch(id, user)
        dispatch(UserAction.userPatched(result))
      } catch (error) {
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  },
  removeUserAdmin: (id: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      const result = await client.service('user').remove(id)
      dispatch(UserAction.userAdminRemoved(result))
    }
  },
  fetchUserRole: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const userRole = await client.service('user-role').find()
        dispatch(UserAction.userRoleRetrieved(userRole))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  createUserRoleAction: (data) => {
    return async (dispatch: Dispatch): Promise<any> => {
      const result = await client.service('user-role').create(data)
      dispatch(UserAction.userRoleCreated(result))
    }
  },
  updateUserRole: (id: string, role: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const userRole = await client.service('user').patch(id, { userRole: role })
        dispatch(UserAction.userRoleUpdated(userRole))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  searchUserAction: (data: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const userState = accessUserState()
        const skip = userState.users.skip.value
        const limit = userState.users.limit.value
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
        dispatch(UserAction.searchedUser(result))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  fetchSingleUserAdmin: (id: string) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('user').get(id)
        dispatch(UserAction.fetchedSingleUser(result))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(dispatch, error.message)
      }
    }
  },
  fetchStaticResource: () => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const result = await client.service('static-resource').find({
          query: {
            staticResourceType: 'avatar'
          }
        })
        dispatch(UserAction.fetchedStaticResource(result))
      } catch (error) {
        console.error(error)
      }
    }
  },
  refetchSingleUserAdmin: () => {
    return async (dispatch: Dispatch): Promise<any> => dispatch(UserAction.refetchSingleUser())
  }
}
