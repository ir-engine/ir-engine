import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Tabs from '@mui/material/Tabs'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import { Theme } from '@mui/material/styles'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { useAuthState } from '../../user/services/AuthService'
import { ADMIN_PAGE_LIMIT } from '../services/AdminService'
import { useLocationState } from '../services/LocationService'
import { UserService } from '../services/UserService'
import { InstanceService } from '../services/InstanceService'
import { useUserState } from '../services/UserService'
import { useInstanceState } from '../services/InstanceService'
import { LocationService } from '../services/LocationService'
import { useSceneState } from '../services/SceneService'
import Grid from '@mui/material/Grid'
import styles from './Admin.module.scss'
import InstanceModal from './Instance/InstanceModal'
import LocationModal from './LocationModal'
import Search from './Search'
import { useTranslation } from 'react-i18next'
import { InstanceSeed } from '@xrengine/common/src/interfaces/Instance'

import { LocationSeed } from '@xrengine/common/src/interfaces/Location'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  locationState?: any
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

  const router = useHistory()
  const adminInstanceState = useInstanceState()
  const authState = useAuthState()

  const user = authState.user
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [instanceModalOpen, setInstanceModalOpen] = useState(false)
  const [locationEditing, setLocationEditing] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(LocationSeed)
  const [selectedInstance, setSelectedInstance] = useState(InstanceSeed)
  const adminSceneState = useSceneState()
  const adminScenes = adminSceneState.scenes

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
    const sceneMatch = adminScenes.value.find((scene) => scene.sid === id)
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
  const dispatch = useDispatch()
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('name')
  const [selected, setSelected] = React.useState<string[]>([])
  const [page, setPage] = React.useState(0)
  const [dense, setDense] = React.useState(false)
  const [rowsPerPage, setRowsPerPage] = React.useState(ADMIN_PAGE_LIMIT)
  const [selectedTab, setSelectedTab] = React.useState('locations')
  const [userRole, setUserRole] = React.useState('')
  const [selectedUser, setSelectedUser] = React.useState({})

  const adminLocationState = useLocationState()
  const adminLocations = adminLocationState.locations.locations
  const adminLocationCount = adminLocationState.locations.total
  const adminUserState = useUserState()
  const adminUsers = adminUserState.users.users
  const adminUserCount = adminUserState.users.total
  const adminInstances = adminInstanceState.instances.instances
  const adminInstanceCount = adminInstanceState.instances.total
  const { t } = useTranslation()

  const selectCount =
    selectedTab === 'locations'
      ? adminLocationCount.value
      : selectedTab === 'users'
      ? adminUserCount.value
      : selectedTab === 'instances'
      ? adminInstanceCount.value
      : 0
  const displayLocations = adminLocations.value.map((location) => {
    return {
      id: location.id,
      name: location.name,
      sceneId: location.sceneId,
      maxUsersPerInstance: location.maxUsersPerInstance,
      type: location.locationSettings?.locationType,
      tags: {
        isFeatured: location?.isFeatured,
        isLobby: location?.isLobby
      },
      instanceMediaChatEnabled: location.locationSettings?.instanceMediaChatEnabled?.toString(),
      videoEnabled: location.locationSettings?.videoEnabled?.toString()
    }
  })

  const displayInstances = adminInstances.value.map((instance) => {
    return {
      id: instance.id,
      ipAddress: instance.ipAddress,
      currentUsers: instance.currentUsers,
      locationId: instance.locationId,
      gsId: instance?.gameserver_subdomain_provision?.gs_id,
      serverAddress:
        instance.gameserver_subdomain_provision != null
          ? `https://${instance.gameserver_subdomain_provision.gs_number}.${globalThis.process.env['VITE_GAMESERVER_HOST']}`
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
      const newSelecteds = adminLocations.value.map((n) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleLocationClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selected = adminLocations.value.find((location) => location.id === id)
    if (selected !== undefined) {
      setSelectedLocation(selected)
      setLocationEditing(true)
      setLocationModalOpen(true)
    }
  }

  const openModalCreate = () => {
    setSelectedLocation(LocationSeed)
    setLocationEditing(false)
    setLocationModalOpen(true)
  }

  const handleInstanceClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selected = adminInstances.value.find((instance) => instance.id.toString() === id)
    if (selected !== undefined) {
      setSelectedInstance(selected)
      setInstanceModalOpen(true)
    }
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    switch (selectedTab) {
      case 'locations':
        LocationService.fetchAdminLocations(incDec)
        break
      case 'users':
        UserService.fetchUsersAsAdmin(incDec)
        break
      case 'instances':
        InstanceService.fetchAdminInstances(incDec)
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
    setSelectedLocation(LocationSeed)
  }

  const handleInstanceClose = (e: any): void => {
    console.log('handleInstanceClosed')
    setInstanceModalOpen(false)
    setSelectedInstance(InstanceSeed)
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
      adminUsers.value.forEach((element) => {
        role[element.id] = element.userRole
      })
      setSelectedUser(role)
    }
  }, [adminUsers])

  useEffect(() => {
    if (user?.id?.value != null && adminLocationState.locations.updateNeeded.value === true) {
      LocationService.fetchAdminLocations()
    }
    if (user?.id?.value != null && adminLocationState.locationTypes.updateNeeded.value === true) {
      LocationService.fetchLocationTypes()
    }
    if (user?.id?.value != null && adminUserState.users.updateNeeded.value === true) {
      UserService.fetchUsersAsAdmin()
    }
    if (user?.id?.value != null && adminInstanceState.instances.updateNeeded.value === true) {
      InstanceService.fetchAdminInstances()
    }
  }, [
    authState.user?.id?.value,
    adminInstanceState.instances.updateNeeded.value,
    adminLocationState.locations.updateNeeded.value,
    adminLocationState.locationTypes.updateNeeded.value
  ])

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
          {user?.userRole.value === 'admin' && <Tab label={t('admin:components.index.lbl-users')} value="users" />}
          {user?.userRole.value === 'admin' && (
            <Tab label={t('admin:components.index.lbl-instances')} value="instances" />
          )}
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
              rowCount={adminLocationCount?.value || 0}
            />
            {selectedTab === 'locations' && (
              <TableBody className={styles.thead}>
                {stableSort(displayLocations, getComparator(order, orderBy)).map((row, index) => {
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
                {stableSort(adminUsers.value, getComparator(order, orderBy)).map((row, index) => {
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
                        {(row.userRole === 'guest' || (row.userRole === 'admin' && row.id === user.id.value)) && (
                          <div>{row.userRole}</div>
                        )}
                        {row.userRole !== 'guest' && row.id !== user.id.value && (
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
                {stableSort(displayInstances, getComparator(order, orderBy)).map((row, index) => {
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
            rowsPerPageOptions={[ADMIN_PAGE_LIMIT]}
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

export default AdminConsole
