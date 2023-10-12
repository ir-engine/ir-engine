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

import React from 'react'

import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'

import { useFind, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { routePath } from '@etherealengine/engine/src/schemas/route/route.schema'
import TableComponent from '../../common/Table'
import { routeColumns } from '../../common/variables/route'
import styles from '../../styles/admin.module.scss'

interface Props {
  className?: string
}

const RouteTable = ({ className }: Props) => {
  const processing = useHookstate(false)

  const installedRouteData = useFind('routes-installed').data
  const routesQuery = useFind(routePath, {
    query: { $limit: 20 }
  })
  const routeActivateCreate = useMutation('route-activate').create

  const isRouteActive = (project: string, route: string) =>
    routesQuery.data.findIndex((a) => {
      return a.project === project && a.route === route
    }) !== -1

  const activateCallback = (project: string, route: string, checked: boolean) => {
    routeActivateCreate({ project, route, activate: checked })
  }

  const installedRoutes = installedRouteData
    .map((el) => {
      if (!el.routes?.length) return []
      return el.routes.map((route) => {
        return {
          id: el.project + route,
          project: el.project,
          route: route,
          action: (
            <Checkbox
              className={styles.checkboxContainer}
              classes={{ checked: styles.routeCheckedCheckbox }}
              checked={isRouteActive(el.project, route)}
              onChange={(ev, checked) => activateCallback(el.project, route, checked)}
            />
          )
        }
      })
    })
    .flat()

  return (
    <Box className={className}>
      <TableComponent query={routesQuery} allowSort={true} rows={installedRoutes} column={routeColumns} />
      {processing.value && (
        <div className={styles.progressBackground}>
          <CircularProgress className={styles.progress} />
        </div>
      )}
    </Box>
  )
}

export default RouteTable
