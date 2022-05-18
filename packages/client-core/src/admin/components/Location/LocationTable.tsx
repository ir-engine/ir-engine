import React, { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Location } from '@xrengine/common/src/interfaces/Location'

import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'

import { useErrorState } from '../../../common/services/ErrorService'
import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import { useFetchAdminInstance } from '../../common/hooks/Instance.hooks'
import { useFetchAdminScenes, useFetchLocation, useFetchLocationTypes } from '../../common/hooks/Location.hooks'
import { useFetchUsersAsAdmin } from '../../common/hooks/User.hooks'
import TableComponent from '../../common/Table'
import { locationColumns, LocationProps } from '../../common/variables/location'
import { InstanceService, useInstanceState } from '../../services/InstanceService'
import { LOCATION_PAGE_LIMIT, LocationService, useLocationState } from '../../services/LocationService'
import { SceneService } from '../../services/SceneService'
import { UserService, useUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import ViewLocation from './ViewLocation'

const LocationTable = (props: LocationProps) => {
  const { search } = props
  const adminInstanceState = useInstanceState()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(LOCATION_PAGE_LIMIT)
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [viewModal, setViewModal] = useState(false)
  const [locationAdmin, setLocationAdmin] = useState<Location>()
  const authState = useAuthState()
  const user = authState.user
  const adminScopeReadErrMsg = useErrorState().readError.scopeErrorMessage
  const adminLocationState = useLocationState()
  const adminLocations = adminLocationState.locations
  const adminLocationCount = adminLocationState.total

  // Call custom hooks
  const { t } = useTranslation()
  const adminUserState = useUserState()
  useFetchLocation(user, adminLocationState, adminScopeReadErrMsg, search, LocationService, sortField, fieldOrder)
  useFetchAdminScenes(user, SceneService)
  useFetchLocationTypes(user, adminLocationState, LocationService)
  useFetchUsersAsAdmin(user, adminUserState, UserService, '', 'name', fieldOrder)
  useFetchAdminInstance(user, adminInstanceState, InstanceService)

  const handlePageChange = (event: unknown, newPage: number) => {
    //const incDec = page < newPage ? 'increment' : 'decrement'
    LocationService.fetchAdminLocations(search, newPage, sortField, fieldOrder)
    setPage(newPage)
  }

  const handleCloseModal = () => {
    setPopConfirmOpen(false)
  }

  useEffect(() => {
    if (adminLocationState.fetched.value) {
      LocationService.fetchAdminLocations(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const submitRemoveLocation = async () => {
    await LocationService.removeLocation(locationId)
    setPopConfirmOpen(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const openViewModal = (open: boolean, location: Location) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return
    }
    setLocationAdmin(location)
    setViewModal(open)
  }

  const closeViewModal = (open) => {
    setViewModal(open)
  }

  const createData = (
    el: Location,
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
          <a href="#h" className={styles.actionStyle} onClick={openViewModal(true, el)}>
            <span className={styles.spanWhite}>{t('admin:components.index.view')}</span>
          </a>
          <a
            href="#h"
            className={styles.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setLocationId(id)
              setLocationName(name)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.index.delete')}</span>
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
        {el.location_setting?.instanceMediaChatEnabled
          ? t('admin:components.index.yes')
          : t('admin:components.index.no')}{' '}
      </div>,
      <div>
        {/**@ts-ignore*/}
        {el.location_setting?.videoEnabled ? t('admin:components.index.yes') : t('admin:components.index.no')}
      </div>
    )
  })

  return (
    <React.Fragment>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder}
        setSortField={setSortField}
        setFieldOrder={setFieldOrder}
        rows={rows}
        column={locationColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminLocationCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModal
        popConfirmOpen={popConfirmOpen}
        handleCloseModal={handleCloseModal}
        submit={submitRemoveLocation}
        name={locationName}
        label={'location'}
      />
      <ViewLocation openView={viewModal} closeViewModal={closeViewModal} locationAdmin={locationAdmin} />
    </React.Fragment>
  )
}

export default LocationTable
