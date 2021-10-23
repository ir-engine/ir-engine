import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { GroupAction } from './GroupActions'
import { AlertService } from '../../common/state/AlertService'
import { accessGroupState } from './GroupState'
/**
 *
 * @param files FIle type
 * @returns URL
 * @author KIMENYI Kevin <kimenyikevin@gmail.com>
 */

export const GroupService = {
  getGroupService: async (incDec?: 'increment' | 'decrement') => {
    const dispatch = useDispatch()
    {
      const skip = accessGroupState().group.skip.value
      const limit = accessGroupState().group.limit.value
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
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  createGroupByAdmin: async (groupItem: any) => {
    const dispatch = useDispatch()
    {
      try {
        const newGroup = await client.service('group').create({ ...groupItem })
        dispatch(GroupAction.addAdminGroup(newGroup))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  patchGroupByAdmin: async (groupId, groupItem) => {
    const dispatch = useDispatch()
    {
      try {
        const group = await client.service('group').patch(groupId, groupItem)
        dispatch(GroupAction.updateGroup(group))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  },
  deleteGroupByAdmin: async (groupId) => {
    const dispatch = useDispatch()
    {
      try {
        await client.service('group').remove(groupId)
        dispatch(GroupAction.removeGroupAction(groupId))
      } catch (err) {
        console.log(err)
        AlertService.dispatchAlertError(err.message)
      }
    }
  }
}
