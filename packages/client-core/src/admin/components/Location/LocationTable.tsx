import React, { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Location } from '@xrengine/common/src/interfaces/Location'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { locationColumns } from '../../common/variables/location'
import { AdminLocationService, LOCATION_PAGE_LIMIT, useAdminLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'
import ViewLocation from './ViewLocation'

interface Props {
  className?: string
  search: string
}

const LocationTable = ({ className, search }: Props) => {
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
  const adminLocationState = useAdminLocationState()
  const adminLocations = adminLocationState.locations
  const adminLocationCount = adminLocationState.total

  // Call custom hooks
  const { t } = useTranslation()

  useEffect(() => {
    AdminLocationService.fetchAdminLocations(search, 0, sortField, fieldOrder)
  }, [search, user?.id?.value, adminLocationState.updateNeeded.value])

  const handlePageChange = (event: unknown, newPage: number) => {
    //const incDec = page < newPage ? 'increment' : 'decrement'
    AdminLocationService.fetchAdminLocations(search, newPage, sortField, fieldOrder)
    setPage(newPage)
  }

  const handleCloseModal = () => {
    setPopConfirmOpen(false)
  }

  useEffect(() => {
    if (adminLocationState.fetched.value) {
      AdminLocationService.fetchAdminLocations(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const submitRemoveLocation = async () => {
    await AdminLocationService.removeLocation(locationId)
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
        )}
      </div>,
      <div>
        {/**@ts-ignore*/}
        {el.location_setting?.instanceMediaChatEnabled
          ? t('admin:components.index.yes')
          : t('admin:components.index.no')}
      </div>,
      <div>
        {/**@ts-ignore*/}
        {el.location_setting?.videoEnabled ? t('admin:components.index.yes') : t('admin:components.index.no')}
      </div>
    )
  })

  return (
    <Box className={className}>
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
        open={popConfirmOpen}
        description={`${t('admin:components.location.confirmLocationDelete')} '${locationName}'?`}
        onClose={handleCloseModal}
        onSubmit={submitRemoveLocation}
      />
      <ViewLocation open={viewModal} locationAdmin={locationAdmin} onClose={() => setViewModal(false)} />
    </Box>
  )
}

export default LocationTable
