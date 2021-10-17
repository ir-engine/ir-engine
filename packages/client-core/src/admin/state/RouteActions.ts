export const RouteActions = {
  installedRoutesRetrievedAction: (data: any) => {
    return {
      type: 'ADMIN_ROUTE_INSTALLED_RECEIVED' as const,
      data: data
    }
  },
  activeRoutesRetrievedAction: (data: any) => {
    return {
      type: 'ADMIN_ROUTE_ACTIVE_RECEIVED' as const,
      data: data
    }
  }
}

export type RouteActionType = ReturnType<typeof RouteActions[keyof typeof RouteActions]>
