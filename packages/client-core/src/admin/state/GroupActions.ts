import { GroupResult } from '@standardcreative/common/src/interfaces/GroupResult'
import { Group } from '@standardcreative/common/src/interfaces/Group'
export const GroupAction = {
  fetchingGroup: () => {
    return {
      type: 'GROUP_FETCHING' as const
    }
  },
  setAdminGroup: (list: GroupResult) => {
    return {
      type: 'GROUP_ADMIN_RETRIEVED' as const,
      list
    }
  },
  addAdminGroup: (item: Group) => {
    return {
      type: 'ADD_GROUP' as const,
      item
    }
  },
  updateGroup: (item: Group) => {
    return {
      type: 'GROUP_ADMIN_UPDATE' as const,
      item
    }
  },
  removeGroupAction: (item: Group) => {
    return {
      type: 'GROUP_ADMIN_DELETE' as const,
      item
    }
  }
}

export type GroupActionType = ReturnType<typeof GroupAction[keyof typeof GroupAction]>
