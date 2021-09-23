import { Dispatch } from 'redux'
import { client } from '../../../../feathers'
import { GroupAction } from './GroupActions'
import { AlertService } from '../../../../common/reducers/alert/AlertService'
import { useGroupState } from './GroupState'
/**
 *
 * @param files FIle type
 * @returns URL
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */

export const GroupService = {
  getGroupService: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch): Promise<any> => {
      const skip = useGroupState().group.skip.value
      const limit = useGroupState().group.limit.value
      try {
        dispatch(GroupAction.fetchingGroup())
        const list = await client.service('group').find({
          query: {
            $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
            $limit: limit
          }
        })
        dispatch(GroupAction.setAdminGroup(list))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  createGroupByAdmin: (groupItem: any) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const newGroup = await client.service('group').create({ ...groupItem })
        dispatch(GroupAction.addAdminGroup(newGroup))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  patchGroupByAdmin: (groupId, groupItem) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        const group = await client.service('group').patch(groupId, groupItem)
        dispatch(GroupAction.updateGroup(group))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  },
  deleteGroupByAdmin: (groupId) => {
    return async (dispatch: Dispatch): Promise<any> => {
      try {
        await client.service('group').remove(groupId)
        dispatch(GroupAction.removeGroupAction(groupId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(dispatch, err.message)
      }
    }
  }
}
