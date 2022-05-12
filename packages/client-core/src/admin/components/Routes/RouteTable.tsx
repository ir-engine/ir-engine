import React, { ChangeEvent, useEffect, useState } from 'react'

import { Checkbox } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

import { useAuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { routeColumns } from '../../common/variables/route'
import { ActiveRouteService, useActiveRouteState } from '../../services/ActiveRouteService'
import { RouteService, useRouteState } from '../../services/RouteService'
import styles from '../../styles/admin.module.scss'

/**
 * Temporary
 */
const ROUTE_PAGE_LIMIT = 1000

/**
 *
 * @param props
 * @returns
 */

const RouteTable = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(ROUTE_PAGE_LIMIT)

  const authState = useAuthState()
  const user = authState.user
  const adminRouteState = useRouteState()
  const adminActiveRouteState = useActiveRouteState()
  const adminRoute = adminRouteState
  const activeRouteData = adminActiveRouteState.activeRoutes
  const installedRouteData = adminRoute.routes
  const adminRouteCount = adminActiveRouteState.total
  const [processing, setProcessing] = useState(false)

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    ActiveRouteService.fetchActiveRoutes(incDec)
    RouteService.fetchInstalledRoutes(incDec)
    setPage(newPage)
  }

  useEffect(() => {
    if (user?.id?.value && adminRoute.updateNeeded.value === true) {
      ActiveRouteService.fetchActiveRoutes()
      RouteService.fetchInstalledRoutes()
    }
  }, [authState.user?.id?.value, adminRouteState.updateNeeded.value])

  useEffect(() => {
    ActiveRouteService.fetchActiveRoutes()
    RouteService.fetchInstalledRoutes()
  }, [])

  useEffect(() => {
    // console.log('setting false', activeRouteData.value)
    // setProcessing(false)
  }, [activeRouteData.value])

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const isRouteActive = (project: string, route: string) =>
    activeRouteData.findIndex((a) => {
      return a.project.value === project && a.route.value === route
    }) !== -1

  const activateCallback = (project: string, route: string, checked: boolean) => {
    // setProcessing(true)
    // setTimeout(() => {
    ActiveRouteService.setRouteActive(project, route, checked)
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
    <React.Fragment>
      <TableComponent
        allowSort={true}
        rows={installedRoutes}
        column={routeColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminRouteCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      {processing && (
        <div className={styles.progressBackground}>
          <CircularProgress className={styles.progress} />
        </div>
      )}
    </React.Fragment>
  )
}

export default RouteTable
