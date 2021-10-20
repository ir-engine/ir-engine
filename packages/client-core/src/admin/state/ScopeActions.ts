import { AdminScopTypeResult } from '@standardcreative/common/src/interfaces/AdminScopeTypeResult'
import { AdminScopeResult } from '@standardcreative/common/src/interfaces/AdminScopeResult'
import { AdminScope } from '@standardcreative/common/src/interfaces/AdminScope'
export const ScopeAction = {
  fetchingScope: () => {
    return {
      type: 'SCOPE_FETCHING' as const
    }
  },
  setAdminScope: (adminScopeResult: AdminScopeResult) => {
    return {
      type: 'SCOPE_ADMIN_RETRIEVED' as const,
      adminScopeResult: adminScopeResult
    }
  },
  addAdminScope: (adminScope: AdminScope) => {
    return {
      type: 'ADD_SCOPE' as const,
      adminScope: adminScope
    }
  },
  updateAdminScope: (adminScope: AdminScope) => {
    return {
      type: 'UPDATE_SCOPE' as const,
      adminScope: adminScope
    }
  },
  removeScopeItem: (id: string) => {
    return {
      type: 'REMOVE_SCOPE' as const,
      id: id
    }
  },
  getScopeType: (adminScopTypeResult: AdminScopTypeResult) => {
    return {
      type: 'SCOPE_TYPE_RETRIEVED',
      adminScopTypeResult: adminScopTypeResult
    }
  }
}

export type ScopeActionType = ReturnType<typeof ScopeAction[keyof typeof ScopeAction]>
