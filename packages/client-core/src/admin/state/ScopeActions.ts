export const ScopeAction = {
  fetchingScope: () => {
    return {
      type: 'SCOPE_FETCHING' as const
    }
  },
  setAdminScope: (list: any[]) => {
    return {
      type: 'SCOPE_ADMIN_RETRIEVED' as const,
      list
    }
  },
  addAdminScope: (item) => {
    return {
      type: 'ADD_SCOPE' as const,
      item
    }
  },
  updateAdminScope: (result) => {
    return {
      type: 'UPDATE_SCOPE' as const,
      item: result
    }
  },
  removeScopeItem: (id) => {
    return {
      type: 'REMOVE_SCOPE' as const,
      id
    }
  },
  getScopeType: (item: any[]) => {
    return {
      type: 'SCOPE_TYPE_RETRIEVED',
      list: item
    }
  }
}

export type ScopeActionType = ReturnType<typeof ScopeAction[keyof typeof ScopeAction]>
