import { Group } from '@standardcreative/common/src/interfaces/Group'
import { GroupUser } from '@standardcreative/common/src/interfaces/GroupUser'
import { GroupResult } from '@standardcreative/common/src/interfaces/GroupResult'

export const GroupAction = {
  loadedGroups: (groupResult: GroupResult) => {
    return {
      type: 'LOADED_GROUPS' as const,
      groups: groupResult.data,
      total: groupResult.total,
      limit: groupResult.limit,
      skip: groupResult.skip
    }
  },
  createdGroup: (group: Group) => {
    return {
      type: 'CREATED_GROUP' as const,
      group: group
    }
  },
  patchedGroup: (group: Group) => {
    return {
      type: 'PATCHED_GROUP' as const,
      group: group
    }
  },
  removedGroup: (group: Group) => {
    return {
      type: 'REMOVED_GROUP' as const,
      group: group
    }
  },
  createdGroupUser: (groupUser: GroupUser) => {
    return {
      type: 'CREATED_GROUP_USER' as const,
      groupUser: groupUser
    }
  },
  patchedGroupUser: (groupUser: GroupUser) => {
    return {
      type: 'PATCHED_GROUP_USER' as const,
      groupUser: groupUser
    }
  },
  removedGroupUser: (groupUser: GroupUser, self: boolean) => {
    return {
      type: 'REMOVED_GROUP_USER' as const,
      groupUser: groupUser,
      self: self
    }
  },
  invitedGroupUser: () => {
    return {
      type: 'INVITED_GROUP_USER' as const
    }
  },
  leftGroup: () => {
    return {
      type: 'LEFT_GROUP' as const
    }
  },
  fetchingGroups: () => {
    return {
      type: 'FETCHING_GROUPS' as const
    }
  },
  loadedInvitableGroups: (groupResult: GroupResult) => {
    return {
      type: 'LOADED_INVITABLE_GROUPS' as const,
      groups: groupResult.data,
      total: groupResult.total,
      limit: groupResult.limit,
      skip: groupResult.skip
    }
  },
  fetchingInvitableGroups: () => {
    return {
      type: 'FETCHING_INVITABLE_GROUPS' as const
    }
  },
  removeCloseGroupDetail: () => {
    return {
      type: 'REMOVE_CLOSE_GROUP_DETAIL' as const
    }
  }
}

export type GroupActionType = ReturnType<typeof GroupAction[keyof typeof GroupAction]>
