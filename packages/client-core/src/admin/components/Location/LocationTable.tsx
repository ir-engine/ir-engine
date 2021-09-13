import React, { ReactElement, useEffect } from 'react'
import { fetchAdminLocations, fetchLocationTypes } from '../../reducers/admin/location/service'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { useLocationStyles, useLocationStyle } from './styles'
import { bindActionCreators, Dispatch } from 'redux'
import { useAuthState } from '../../../user/reducers/auth/AuthState'
import { selectAppState } from '../../../common/reducers/app/selector'
import { selectAdminLocationState } from '../../reducers/admin/location/selector'
import { selectAdminInstanceState } from '../../reducers/admin/instance/selector'
import { selectAdminUserState } from '../../reducers/admin/user/selector'
import { fetchAdminScenes } from '../../reducers/admin/scene/service'
import { selectAdminSceneState } from '../../reducers/admin/scene/selector'
import { fetchUsersAsAdmin } from '../../reducers/admin/user/service'
import { fetchAdminInstances } from '../../reducers/admin/instance/service'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { locationColumns, LocationProps } from './variable'
import Chip from '@material-ui/core/Chip'
import Avatar from '@material-ui/core/Avatar'
import TablePagination from '@material-ui/core/TablePagination'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import { removeLocation } from '../../reducers/admin/location/service'
import ViewLocation from './ViewLocation'
import { LOCATION_PAGE_LIMIT } from '../../reducers/admin/location/reducers'

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    adminLocationState: selectAdminLocationState(state),
    adminUserState: selectAdminUserState(state),
    adminInstanceState: selectAdminInstanceState(state),
    adminSceneState: selectAdminSceneState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
  fetchAdminScenes: bindActionCreators(fetchAdminScenes, dispatch),
  fetchLocationTypes: bindActionCreators(fetchLocationTypes, dispatch),
  fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
  fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch),
  removeLocation: bindActionCreators(removeLocation, dispatch)
})

const LocationTable = (props: LocationProps) => {
  const classes = useLocationStyles()
  const classex = useLocationStyle()
  const {
    fetchAdminLocations,
    fetchAdminScenes,
    fetchLocationTypes,
    fetchUsersAsAdmin,
    fetchAdminInstances,
    adminLocationState,
    adminUserState,
    adminInstanceState,
    adminSceneState,
    removeLocation
  } = props
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(LOCATION_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [locationId, setLocationId] = React.useState('')
  const [viewModel, setViewModel] = React.useState(false)
  const [locationAdmin, setLocationAdmin] = React.useState('')

  const authState = useAuthState()
  const user = authState.user

  const adminLocations = adminLocationState.get('locations').get('locations')
  const adminLocationCount = adminLocationState.get('locations').get('total')
  const { t } = useTranslation()

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    fetchAdminLocations(incDec)
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  useEffect(() => {
    if (user?.id.value != null && adminLocationState.get('locations').get('updateNeeded') === true) {
      fetchAdminLocations()
    }
    if (user?.id.value != null && adminSceneState.get('scenes').get('updateNeeded') === true) {
      fetchAdminScenes('all')
    }
    if (user?.id.value != null && adminLocationState.get('locationTypes').get('updateNeeded') === true) {
      fetchLocationTypes()
    }
    if (user?.id.value != null && adminUserState.get('users').get('updateNeeded') === true) {
      fetchUsersAsAdmin()
    }
    if (user?.id.value != null && adminInstanceState.get('instances').get('updateNeeded') === true) {
      fetchAdminInstances()
    }
  }, [authState, adminSceneState, adminInstanceState, adminLocationState])

  const openViewModel = (open: boolean, location: any) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setLocationAdmin(location)
    setViewModel(open)
  }

  const closeViewModel = (open) => {
    setViewModel(open)
  }

  const createData = (
    el: any,
    id: string,
    name: string,
    sceneId: string,
    maxUsersPerInstance: string,
    scene: string,
    type: string,
    tags: any,
    instanceMediaChatEnabled: ReactElement<any, any>,
    videoEnabled: ReactElement<any, any>
  ) => {
    return {
      el,
      id,
      name,
      sceneId,
      maxUsersPerInstance,
      scene,
      type,
      tags,
      instanceMediaChatEnabled,
      videoEnabled,
      action: (
        <>
          <a href="#h" className={classex.actionStyle} onClick={openViewModel(true, el)}>
            <span className={classex.spanWhite}>View</span>
          </a>
          <a
            href="#h"
            className={classex.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setLocationId(id)
            }}
          >
            {' '}
            <span className={classex.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = adminLocations.map((el) => {
    return createData(
      el,
      el.id,
      el.name,
      el.sceneId,
      el.maxUsersPerInstance,
      el.slugifiedName,
      el.location_setting?.locationType,
      <div>
        {' '}
        {el.isFeatured && (
          <Chip
            style={{ marginLeft: '5px' }}
            avatar={<Avatar>F</Avatar>}
            label={t('admin:components.index.featured')}
            //  onClick={handleClick}
          />
        )}
        {el.isLobby && (
          <Chip
            avatar={<Avatar>L</Avatar>}
            label={t('admin:components.index.lobby')}
            // onClick={handleClick}
          />
        )}{' '}
      </div>,
      <div> {el.location_setting?.instanceMediaChatEnabled ? 'Yes' : 'No'} </div>,
      <div> {el.location_setting?.videoEnabled ? 'Yes' : 'No'}</div>
    )
  })

  return (
    <div>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {locationColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classex.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {locationColumns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classex.tableCellBody}>
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[LOCATION_PAGE_LIMIT]}
        component="div"
        count={adminLocationCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classex.tableFooter}
      />
      <Dialog
        open={popConfirmOpen}
        onClose={() => setPopConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        classes={{ paper: classes.paperDialog }}
      >
        <DialogTitle id="alert-dialog-title">Confirm location deletion</DialogTitle>
        <DialogActions>
          <Button onClick={() => setPopConfirmOpen(false)} className={classes.spanNone}>
            Cancel
          </Button>
          <Button
            className={classes.spanDange}
            onClick={async () => {
              await removeLocation(locationId)
              setPopConfirmOpen(false)
            }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <ViewLocation openView={viewModel} closeViewModel={closeViewModel} locationAdmin={locationAdmin} />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationTable)
