import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Select from '@material-ui/core/Select'
import Tab from '@material-ui/core/Tab'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Tabs from '@material-ui/core/Tabs'
import Avatar from '@material-ui/core/Avatar'
import Chip from '@material-ui/core/Chip'
import FormControl from '@material-ui/core/FormControl'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Config } from '../../helper'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { selectAppState } from '../../common/reducers/app/selector'
import { client } from '../../feathers'
import { selectAuthState } from '../../user/reducers/auth/selector'
import { PAGE_LIMIT } from '../reducers/admin/reducers'
import { selectAdminLocationState } from '../reducers/admin/location/selector'
import { fetchAdminScenes } from '../reducers/admin/scene/service'
import { fetchUsersAsAdmin } from '../reducers/admin/user/service'
import { fetchAdminInstances } from '../reducers/admin/instance/service'
import { selectAdminUserState } from './../reducers/admin/user/selector'
import { selectAdminInstanceState } from './../reducers/admin/instance/selector'
import { fetchAdminLocations, fetchLocationTypes } from '../reducers/admin/location/service'
import { selectAdminSceneState } from './../reducers/admin/scene/selector'
import Grid from '@material-ui/core/Grid'
import styles from './Admin.module.scss'
import InstanceModal from './Instance/InstanceModal'
import LocationModal from './LocationModal'
import Search from './Search'
import { useTranslation } from 'react-i18next'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  adminState?: any
  authState?: any
  locationState?: any
  fetchAdminLocations?: any
  fetchAdminScenes?: any
  fetchLocationTypes?: any
  fetchUsersAsAdmin?: any
  fetchAdminInstances?: any
  adminLocationState?: any
  adminUserState?: any
  adminInstanceState?: any
  adminSceneState?: any
}

type Order = 'asc' | 'desc'
interface EnhancedTableProps {
  object: string
  numSelected: number
  onRequestSort: (event: React.MouseEvent<unknown>, property) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: Order
  orderBy: string
  rowCount: number
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { object, order, orderBy, onRequestSort } = props
  const { t } = useTranslation()

  const headCells = {
    locations: [
      { id: 'id', numeric: false, disablePadding: true, label: t('admin:components.index.col-id') },
      { id: 'name', numeric: false, disablePadding: false, label: t('admin:components.index.col-name') },
      { id: 'sceneId', numeric: false, disablePadding: false, label: t('admin:components.index.col-scene') },
      {
        id: 'maxUsersPerInstance',
        numeric: true,
        disablePadding: false,
        label: t('admin:components.index.col-maxuser')
      },
      { id: 'type', numeric: false, disablePadding: false, label: t('admin:components.index.col-type') },
      { id: 'tags', numeric: false, disablePadding: false, label: t('admin:components.index.col-tags') },
      {
        id: 'instanceMediaChatEnabled',
        numeric: false,
        disablePadding: false,
        label: t('admin:components.index.col-mc')
      },
      { id: 'videoEnabled', numeric: false, disablePadding: false, label: t('admin:components.index.col-ve') }
    ],
    users: [
      { id: 'id', numeric: false, disablePadding: true, label: t('admin:components.index.col-id') },
      { id: 'name', numeric: false, disablePadding: false, label: t('admin:components.index.col-name') },
      { id: 'instanceId', numeric: false, disablePadding: false, label: t('admin:components.index.col-instanceId') },
      { id: 'userRole', numeric: false, disablePadding: false, label: t('admin:components.index.col-userRole') },
      { id: 'partyId', numeric: false, disablePadding: false, label: t('admin:components.index.col-partyId') }
    ],
    instances: [
      { id: 'id', numeric: false, disablePadding: true, label: t('admin:components.index.col-id') },
      { id: 'ipAddress', numeric: false, disablePadding: false, label: t('admin:components.index.col-ip') },
      { id: 'gsId', numeric: false, disablePadding: false, label: t('admin:components.index.col-gameserverID') },
      {
        id: 'serverAddress',
        numeric: false,
        disablePadding: false,
        label: t('admin:components.index.col-publicAddress')
      },
      { id: 'currentUsers', numeric: true, disablePadding: false, label: t('admin:components.index.col-currentUsers') },
      { id: 'locationId', numeric: false, disablePadding: false, label: t('admin:components.index.col-locationId') }
    ]
  }
  const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead className={styles.thead}>
      <TableRow className={styles.trow}>
        {headCells[object].map((headCell) => (
          <TableCell
            className={styles.tcell}
            key={headCell.id}
            align="center"
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const mapStateToProps = (state: any): any => {
  return {
    appState: selectAppState(state),
    authState: selectAuthState(state),
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
  fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch)
})

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: 120,
      backgroundColor: 'white'
    },
    selectEmpty: {
      marginTop: theme.spacing(0)
    },
    marginBottom: {
      marginBottom: '10px'
    }
  })
)

const AdminConsole = (props: Props) => {
  const classes = useStyles()
  const {
    authState,
    fetchAdminLocations,
    fetchAdminScenes,
    fetchLocationTypes,
    fetchUsersAsAdmin,
    fetchAdminInstances,
    adminLocationState,
    adminUserState,
    adminInstanceState,
    adminSceneState
  } = props

  const router = useHistory()

  const initialLocation = {
    id: null,
    name: '',
    maxUsersPerInstance: 10,
    sceneId: null,
    locationSettingsId: null,
    location_setting: {
      instanceMediaChatEnabled: false,
      videoEnabled: false,
      locationType: 'private'
    }
  }

  const initialInstance = {
    id: '',
    ipAddress: '',
    currentUsers: 0,
    locationId: ''
  }

  const user = authState.get('user')
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [instanceModalOpen, setInstanceModalOpen] = useState(false)
  const [locationEditing, setLocationEditing] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [selectedInstance, setSelectedInstance] = useState(initialInstance)
  const adminScenes = adminSceneState.get('scenes').get('scenes')

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1
    }
    if (b[orderBy] > a[orderBy]) {
      return 1
    }
    return 0
  }

  const getScene = (id: string): string => {
    const sceneMatch = adminScenes.find((scene) => scene.sid === id)
    return sceneMatch != null ? `${sceneMatch.name} (${sceneMatch.sid})` : ''
  }

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }

  function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0])
      if (order !== 0) return order
      return a[1] - b[1]
    })
    return stabilizedThis.map((el) => el[0])
  }

  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('name')
  const [selected, setSelected] = React.useState<string[]>([])
  const [page, setPage] = React.useState(0)
  const [dense, setDense] = React.useState(false)
  const [rowsPerPage, setRowsPerPage] = React.useState(PAGE_LIMIT)
  const [selectedTab, setSelectedTab] = React.useState('locations')
  const [userRole, setUserRole] = React.useState('')
  const [selectedUser, setSelectedUser] = React.useState({})

  const adminLocations = adminLocationState.get('locations').get('locations')
  const adminLocationCount = adminLocationState.get('locations').get('total')
  const adminUsers = adminUserState.get('users').get('users')
  const adminUserCount = adminUserState.get('users').get('total')
  const adminInstances = adminInstanceState.get('instances').get('instances')
  const adminInstanceCount = adminInstanceState.get('instances').get('total')
  const { t } = useTranslation()

  const selectCount =
    selectedTab === 'locations'
      ? adminLocationCount
      : selectedTab === 'users'
      ? adminUserCount
      : selectedTab === 'instances'
      ? adminInstanceCount
      : 0
  const displayLocations = adminLocations.map((location) => {
    return {
      id: location.id,
      name: location.name,
      sceneId: location.sceneId,
      maxUsersPerInstance: location.maxUsersPerInstance,
      type: location?.location_setting?.locationType,
      tags: {
        isFeatured: location?.isFeatured,
        isLobby: location?.isLobby
      },
      instanceMediaChatEnabled: location?.location_setting?.instanceMediaChatEnabled?.toString(),
      videoEnabled: location?.location_setting?.videoEnabled?.toString()
    }
  })

  const displayInstances = adminInstances.map((instance) => {
    return {
      id: instance.id,
      ipAddress: instance.ipAddress,
      currentUsers: instance.currentUsers,
      locationId: instance.locationId,
      gsId: instance.gameserver_subdomain_provision?.gs_id,
      serverAddress:
        instance.gameserver_subdomain_provision != null
          ? `https://${instance.gameserver_subdomain_provision.gs_number}.${Config.publicRuntimeConfig.gameserverDomain}`
          : ''
    }
  })

  const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = adminLocations.map((n) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleLocationClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selected = adminLocations.find((location) => location.id === id)
    setSelectedLocation(selected)
    setLocationEditing(true)
    setLocationModalOpen(true)
  }

  const openModalCreate = () => {
    setSelectedLocation(initialLocation)
    setLocationEditing(false)
    setLocationModalOpen(true)
  }

  const handleInstanceClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selected = adminInstances.find((instance) => instance.id === id)
    setSelectedInstance(selected)
    setInstanceModalOpen(true)
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    switch (selectedTab) {
      case 'locations':
        fetchAdminLocations(incDec)
        break
      case 'users':
        fetchUsersAsAdmin(incDec)
        break
      case 'instances':
        fetchAdminInstances(incDec)
        break
    }
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleLocationClose = (e: any): void => {
    setLocationEditing(false)
    setLocationModalOpen(false)
    setSelectedLocation(initialLocation)
  }

  const handleInstanceClose = (e: any): void => {
    console.log('handleInstanceClosed')
    setInstanceModalOpen(false)
    setSelectedInstance(initialInstance)
  }

  const handleTabChange = (e: any, newValue: string) => {
    setSelectedTab(newValue)
  }

  const redirectToInstance = async (e: any, instanceId: string) => {
    try {
      const instance = await client.service('instance').get(instanceId)
      const location = await client.service('location').get(instance.locationId)
      const route = `/location/${location.slugifiedName}?instanceId=${instance.id}`
      router.push(route)
    } catch (err) {
      console.log('Error redirecting to instance:')
      console.log(err)
    }
  }

  const patchUserRole = async (user: any, role: string) => {
    await client.service('user').patch(user, {
      userRole: role
    })
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>, user: any) => {
    let role = {}
    if (user) {
      patchUserRole(user, event.target.value as string)
      role[user] = event.target.value
      setUserRole(event.target.value as string)
      setSelectedUser({ ...selectedUser, ...role })
    }
  }

  useEffect(() => {
    if (Object.keys(selectedUser).length === 0) {
      let role = {}
      adminUsers.forEach((element) => {
        role[element.id] = element.userRole
      })
      setSelectedUser(role)
    }
  }, [adminUsers])

  useEffect(() => {
    if (user?.id != null && adminLocationState.get('locations').get('updateNeeded') === true) {
      fetchAdminLocations()
    }
    if (user?.id != null && adminSceneState.get('scenes').get('updateNeeded') === true) {
      fetchAdminScenes()
    }
    if (user?.id != null && adminLocationState.get('locationTypes').get('updateNeeded') === true) {
      fetchLocationTypes()
    }
    if (user?.id != null && adminUserState.get('users').get('updateNeeded') === true) {
      fetchUsersAsAdmin()
    }
    if (user?.id != null && adminInstanceState.get('instances').get('updateNeeded') === true) {
      fetchAdminInstances()
    }
  }, [authState, adminSceneState, adminInstanceState, adminLocationState])

  const handleClick = () => {
    console.info('You clicked the Chip.')
  }
  return (
    <div>
      <Grid container spacing={3} className={classes.marginBottom}>
        <Grid item xs={9}>
          <Search typeName="locations" />
        </Grid>
        <Grid item xs={3}>
          <Button
            className={styles.createLocation}
            type="submit"
            variant="contained"
            color="primary"
            onClick={openModalCreate}
          >
            {t('admin:components.index.lbl-newLocation')}
          </Button>
        </Grid>
      </Grid>
      <Paper className={styles.adminRoot}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="tabs">
          <Tab label={t('admin:components.index.lbl-locations')} value="locations" />
          {user?.userRole === 'admin' && <Tab label={t('admin:components.index.lbl-users')} value="users" />}
          {user?.userRole === 'admin' && <Tab label={t('admin:components.index.lbl-instances')} value="instances" />}
        </Tabs>
        <TableContainer className={styles.tableContainer}>
          <Table
            stickyHeader
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              object={selectedTab}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={adminLocationCount || 0}
            />
            {selectedTab === 'locations' && (
              <TableBody className={styles.thead}>
                {stableSort(displayLocations, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <TableRow
                        hover
                        className={styles.trowHover}
                        style={{ color: 'black !important' }}
                        onClick={(event) => handleLocationClick(event, row.id.toString())}
                        tabIndex={-1}
                        key={row.id}
                      >
                        <TableCell
                          className={styles.tcell}
                          component="th"
                          id={row.id.toString()}
                          align="right"
                          scope="row"
                          padding="none"
                        >
                          {row.id}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.name}
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          {getScene(row.sceneId as string)}
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          {row.maxUsersPerInstance}
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          {row.type}
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          {(row.tags as any).isLobby && (
                            <Chip
                              avatar={<Avatar>L</Avatar>}
                              label={t('admin:components.index.lobby')}
                              onClick={handleClick}
                            />
                          )}
                          {(row.tags as any).isFeatured && (
                            <Chip
                              style={{ marginLeft: '5px' }}
                              avatar={<Avatar>F</Avatar>}
                              label={t('admin:components.index.featured')}
                              onClick={handleClick}
                            />
                          )}
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          {row.videoEnabled}
                        </TableCell>
                        <TableCell className={styles.tcell} align="center">
                          {row.instanceMediaChatEnabled}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            )}
            {selectedTab === 'users' && (
              <TableBody className={styles.thead}>
                {stableSort(adminUsers, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <TableRow
                        className={styles.trow}
                        style={{ color: 'black !important' }}
                        // onClick={(event) => handleClick(event, row.id.toString())}
                        tabIndex={-1}
                        key={row.id}
                      >
                        <TableCell
                          className={styles.tcell}
                          component="th"
                          id={row.id.toString()}
                          align="right"
                          scope="row"
                          padding="none"
                        >
                          {row.id}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.name}
                        </TableCell>
                        <TableCell
                          className={
                            row.instanceId != null && row.instanceId !== '' ? styles.tcellSelectable : styles.tcell
                          }
                          align="right"
                          onClick={(event) =>
                            row.instanceId != null && row.instancedId !== ''
                              ? redirectToInstance(event, row.instanceId.toString())
                              : {}
                          }
                        >
                          {row.instanceId}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {(row.userRole === 'guest' || (row.userRole === 'admin' && row.id === user.id)) && (
                            <div>{row.userRole}</div>
                          )}
                          {row.userRole !== 'guest' && row.id !== user.id && (
                            <>
                              <p> {row.userRole && row.userRole} </p>
                              <FormControl className={classes.formControl}>
                                <Select
                                  value={selectedUser[row.userRole]}
                                  onChange={(e) => handleChange(e, row.id)}
                                  className={classes.selectEmpty}
                                >
                                  <MenuItem key="user" value="user">
                                    User
                                  </MenuItem>
                                  <MenuItem key="admin" value="admin">
                                    Admin
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </>
                          )}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.partyId}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            )}
            {selectedTab === 'instances' && (
              <TableBody className={styles.thead}>
                {stableSort(displayInstances, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <TableRow
                        className={styles.trow}
                        style={{ color: 'black !important' }}
                        // onClick={(event) => handleClick(event, row.id.toString())}
                        tabIndex={-1}
                        key={row.id}
                      >
                        <TableCell
                          className={styles.tcell}
                          component="th"
                          id={row.id.toString()}
                          align="right"
                          scope="row"
                          padding="none"
                        >
                          {row.id}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.ipAddress}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.gsId}
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.serverAddress}
                        </TableCell>
                        <TableCell
                          className={styles.tcellSelectable}
                          align="center"
                          onClick={(event) => handleInstanceClick(event, row.id.toString())}
                        >
                          <p className={styles.currentUser}>{row.currentUsers}</p>
                        </TableCell>
                        <TableCell className={styles.tcell} align="right">
                          {row.locationId}
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            )}
          </Table>
        </TableContainer>

        <div className={styles.tableFooter}>
          {selectedTab !== 'locations' && <div />}
          <TablePagination
            rowsPerPageOptions={[PAGE_LIMIT]}
            component="div"
            count={selectCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            className={styles.tablePagination}
          />
        </div>
        <LocationModal
          editing={locationEditing}
          location={selectedLocation}
          open={locationModalOpen}
          handleClose={handleLocationClose}
        />
        <InstanceModal instance={selectedInstance} open={instanceModalOpen} handleClose={handleInstanceClose} />
      </Paper>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminConsole)
