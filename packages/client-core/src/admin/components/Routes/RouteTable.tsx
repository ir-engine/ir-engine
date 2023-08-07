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

import React, { ChangeEvent, useEffect } from 'react'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { routeColumns } from '../../common/variables/route'
import { AdminActiveRouteService, AdminActiveRouteState } from '../../services/ActiveRouteService'
import { AdminRouteState, RouteService } from '../../services/RouteService'
import styles from '../../styles/admin.module.scss'

/**
 * Temporary
 */
const ROUTE_PAGE_LIMIT = 1000

interface Props {
  className?: string
}

/**
 *
 * @param props
 * @returns
 */

const RouteTable = ({ className }: Props) => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(ROUTE_PAGE_LIMIT)

  const authState = useHookstate(getMutableState(AuthState))
  const user = authState.user
  const adminRouteState = useHookstate(getMutableState(AdminRouteState))
  const adminActiveRouteState = useHookstate(getMutableState(AdminActiveRouteState))
  const activeRouteData = adminActiveRouteState.activeRoutes
  const installedRouteData = adminRouteState.routes
  const adminRouteCount = adminActiveRouteState.total
  const processing = useHookstate(false)

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page.value < newPage ? 'increment' : 'decrement'
    AdminActiveRouteService.fetchActiveRoutes(incDec)
    RouteService.fetchInstalledRoutes(newPage)
    page.set(newPage)
  }

  useEffect(() => {
    if (user?.id?.value && adminRouteState.updateNeeded.value === true) {
      AdminActiveRouteService.fetchActiveRoutes()
      RouteService.fetchInstalledRoutes()
    }
  }, [authState.user?.id?.value, adminRouteState.updateNeeded.value])

  useEffect(() => {
    AdminActiveRouteService.fetchActiveRoutes()
    RouteService.fetchInstalledRoutes()
  }, [])

  useEffect(() => {
    // console.log('setting false', activeRouteData.value)
    // setProcessing(false)
  }, [activeRouteData.value])

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }

  const isRouteActive = (project: string, route: string) =>
    activeRouteData.findIndex((a) => {
      return a.project.value === project && a.route.value === route
    }) !== -1

  const activateCallback = (project: string, route: string, checked: boolean) => {
    // setProcessing(true)
    // setTimeout(() => {
    AdminActiveRouteService.setRouteActive(project, route, checked)
    // }, 1000)
  }

  const installedRoutes = installedRouteData
    .map((el) => {
      if (!el.routes?.length) return []
      return el.routes.map((route) => {
        return {
          id: el.project.value + route.value,
          project: el.project.value,
          route: route.value,
          action: (
            <Checkbox
              className={styles.checkboxContainer}
              classes={{ checked: styles.routeCheckedCheckbox }}
              checked={isRouteActive(el.project.value, route.value)}
              onChange={(ev, checked) => activateCallback(el.project.value, route.value, checked)}
            />
          )
        }
      })
    })
    .flat()

  return (
    <Box className={className}>
      <TableComponent
        allowSort={true}
        rows={installedRoutes}
        column={routeColumns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminRouteCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      {processing.value && (
        <div className={styles.progressBackground}>
          <CircularProgress className={styles.progress} />
        </div>
      )}
    </Box>
  )
}

export default RouteTable
