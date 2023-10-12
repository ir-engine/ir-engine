import { defineState } from '@etherealengine/hyperflux'
import React from 'react'

export type AdminRouteStateType = {
  name: string
  scope: string
  redirect?: string
  component: React.LazyExoticComponent<() => JSX.Element>
  access: boolean
  icon: JSX.Element
}

export const AllowedAdminRoutesState = defineState({
  name: 'AllowedAdminRoutesState',
  initial: {} as Record<string, AdminRouteStateType>
})
