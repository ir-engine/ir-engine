import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useErrorState } from '../../../common/services/ErrorService'
import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModel from '../../common/ConfirmModel'
import { useFetchAdminInstance } from '../../common/hooks/Instance.hooks'
import { useFetchAdminScenes, useFetchLocation, useFetchLocationTypes } from '../../common/hooks/Location.hooks'
import { useFetchUsersAsAdmin } from '../../common/hooks/User.hooks'
import TableComponent from '../../common/Table'
import { locationColumns, LocationProps } from '../../common/variables/location'
import { InstanceService, useInstanceState } from '../../services/InstanceService'
import { LocationService, LOCATION_PAGE_LIMIT, useLocationState } from '../../services/LocationService'
import { SceneService } from '../../services/SceneService'
import { UserService, useUserState } from '../../services/UserService'
import { useStyles } from '../../styles/ui'
import ViewLocation from './ViewLocation'

const LocationTable = (props: LocationProps) => {
  const { search } = props
  const classes = useStyles()
  const adminInstanceState = useInstanceState()

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(LOCATION_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = React.useState(false)
  const [locationId, setLocationId] = React.useState('')
  const [locationName, setLocationName] = React.useState('')
  const [viewModel, setViewModel] = React.useState(false)
  const [locationAdmin, setLocationAdmin] = React.useState('')
  const dispatch = useDispatch()
  const authState = useAuthState()
  const user = authState.user
  const adminScopeReadErrMsg = useErrorState().readError.scopeErrorMessage
  const adminLocationState = useLocationState()
  const adminLocations = adminLocationState.locations
  const adminLocationCount = adminLocationState.total

  // Call custom hooks
  const { t } = useTranslation()
  const adminUserState = useUserState()
  useFetchLocation(user, adminLocationState, adminScopeReadErrMsg, search, LocationService)
  useFetchAdminScenes(user, SceneService)
  useFetchLocationTypes(user, adminLocationState, LocationService)
  useFetchUsersAsAdmin(user, adminUserState, UserService)
  useFetchAdminInstance(user, adminInstanceState, InstanceService)

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    LocationService.fetchAdminLocations(incDec)
    setPage(newPage)
  }

  const handleCloseModel = () => {
    setPopConfirmOpen(false)
  }

  const submitRemoveLocation = async () => {
    await LocationService.removeLocation(locationId)
    setPopConfirmOpen(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

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
          <a href="#h" className={classes.actionStyle} onClick={openViewModel(true, el)}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a
            href="#h"
            className={classes.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setLocationId(id)
              setLocationName(name)
            }}
          >
            <span className={classes.spanDange}>Delete</span>
          </a>
        </>
      )
    }
  }

  const rows = adminLocations.value.map((el) => {
    return createData(
      el,
      el.id,
      el.name,
      el.sceneId,
      el.maxUsersPerInstance.toString(),
      el.slugifiedName,
      //@ts-ignore
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
      <div>
        {/**@ts-ignore*/}
        {el.location_setting?.instanceMediaChatEnabled ? 'Yes' : 'No'}{' '}
      </div>,
      <div>
        {/**@ts-ignore*/}
        {el.location_setting?.videoEnabled ? 'Yes' : 'No'}
      </div>
    )
  })

  return (
    <React.Fragment>
      <TableComponent
        rows={rows}
        column={locationColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminLocationCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModel
        popConfirmOpen={popConfirmOpen}
        handleCloseModel={handleCloseModel}
        submit={submitRemoveLocation}
        name={locationName}
        label={'location'}
      />
      <ViewLocation openView={viewModel} closeViewModel={closeViewModel} locationAdmin={locationAdmin} />
    </React.Fragment>
  )
}

export default LocationTable
