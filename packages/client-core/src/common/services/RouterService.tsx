/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

import { createBrowserHistory, History } from 'history'
import i18n from 'i18next'
import React, { lazy, useEffect, useLayoutEffect } from 'react'
import { BrowserRouterProps as NativeBrowserRouterProps, Router } from 'react-router-dom'

import { routePath, RouteType } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineState, NO_PROXY, useHookstate } from '@etherealengine/hyperflux'
import { loadRoute } from '@etherealengine/projects/loadRoute'

type SearchParamsType = { [key: string]: string }

export const history = createBrowserHistory()

export interface BrowserRouterProps extends Omit<NativeBrowserRouterProps, 'window'> {
  history: History
}

export const BrowserRouter: React.FC<BrowserRouterProps> = React.memo((props) => {
  const { history, ...restProps } = props
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location
  })

  useLayoutEffect(() => history.listen(setState), [history])

  return <Router {...restProps} location={state.location} navigationType={state.action} navigator={history} />
})

export const RouterState = defineState({
  name: 'RouterState',
  initial: {},
  navigate: (pathname: string, searchParams: SearchParamsType | { redirectUrl: string } = {}) => {
    const urlSearchParams = new URLSearchParams(searchParams)

    if (urlSearchParams.toString().length > 0) {
      history.push(`${pathname}?${urlSearchParams}`)
    } else {
      history.push(pathname)
    }
  }
})

export type CustomRoute = {
  route: string
  component: ReturnType<typeof lazy>
  componentProps?: {
    [x: string]: any
  }
  props?: {
    [x: string]: any
    exact?: boolean
  }
}

/**
 * getCustomRoutes used to get the routes created by the user.
 */
export const getCustomRoutes = async (): Promise<CustomRoute[]> => {
  const routes = (await Engine.instance.api
    .service(routePath)
    .find({ query: { paginate: false } })) as any as RouteType[]

  const elements: CustomRoute[] = []

  if (!Array.isArray(routes) || routes == null) {
    throw new Error(i18n.t('editor:errors.fetchingRouteError', { error: i18n.t('editor:errors.unknownError') }))
  } else {
    await Promise.all(
      routes.map(async (project) => {
        const routeLazyLoad = await loadRoute(project.project, project.route)
        if (routeLazyLoad)
          elements.push({
            route: project.route,
            ...routeLazyLoad
          })
      })
    )
  }

  return elements.filter((c) => !!c)
}

export const useCustomRoutes = () => {
  const customRoutes = useHookstate([] as CustomRoute[])

  useEffect(() => {
    getCustomRoutes().then((routes) => {
      customRoutes.set(routes)
    })
  }, [])

  return customRoutes.get(NO_PROXY) as CustomRoute[]
}
