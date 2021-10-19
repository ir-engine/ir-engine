import { store, useDispatch } from '../../store'
import { UserAction } from './UserActions'
import { client } from '../../feathers'
import { AlertService } from '../../common/state/AlertService'
import { accessUserState } from './UserState'

export const UserService = {
  fetchUsersAsAdmin: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  createUser: async (user: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('user').create(user)
        dispatch(UserAction.userCreated(result))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  patchUser: async (id: string, user: any) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('user').patch(id, user)
        dispatch(UserAction.userPatched(result))
      } catch (error) {
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  removeUserAdmin: async (id: string) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('user').remove(id)
      dispatch(UserAction.userAdminRemoved(result))
    }
  },
  fetchUserRole: async () => {
    const dispatch = useDispatch()
    {
      try {
        const userRole = await client.service('user-role').find()
        dispatch(UserAction.userRoleRetrieved(userRole))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  createUserRoleAction: async (data) => {
    const dispatch = useDispatch()
    {
      const result = await client.service('user-role').create(data)
      dispatch(UserAction.userRoleCreated(result))
    }
  },
  updateUserRole: async (id: string, role: string) => {
    const dispatch = useDispatch()
    {
      try {
        const userRole = await client.service('user').patch(id, { userRole: role })
        dispatch(UserAction.userRoleUpdated(userRole))
      } catch (err) {
        console.error(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  searchUserAction: async (data: any) => {
    const dispatch = useDispatch()
    {
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  fetchSingleUserAdmin: async (id: string) => {
    const dispatch = useDispatch()
    {
      try {
        const result = await client.service('user').get(id)
        dispatch(UserAction.fetchedSingleUser(result))
      } catch (error) {
        console.error(error)
        AlertService.dispatchAlertError(error.message)
      }
    }
  },
  fetchStaticResource: async () => {
    const dispatch = useDispatch()
    {
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
  refetchSingleUserAdmin: async () => {}
}
