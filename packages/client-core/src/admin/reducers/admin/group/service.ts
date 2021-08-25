import Api from '../../../../world/components/editor/Api'
import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { fetchingGroup, setAdminGroup, addAdminGroup, updateGroup, removeGroupAction } from './actions'
import { dispatchAlertError } from '../../../../common/reducers/alert/service'

/**
 *
 * @param files FIle type
 * @returns URL
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */
export function getGroupService(type?: string, limit: Number = 12) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(fetchingGroup())
      const list = await client.service('group').find({
        query: {
          action: type,
          $limit: limit
        }
      })
      dispatch(setAdminGroup(list))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function createGroupByAdmin(groupItem: any) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const newGroup = await client.service('group').create({ ...groupItem })
      dispatch(addAdminGroup(newGroup))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function patchGroupByAdmin(groupId, groupItem) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const group = await client.service('group').patch(groupId, groupItem)
      dispatch(updateGroup(group))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}

export function deleteGroupByAdmin(groupId) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      await client.service('group').remove(groupId)
      dispatch(removeGroupAction(groupId))
    } catch (err) {
      console.log(err)
      dispatchAlertError(dispatch, err.message)
    }
  }
}
