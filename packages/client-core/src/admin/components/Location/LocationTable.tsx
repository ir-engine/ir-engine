import React, { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Location } from '@xrengine/common/src/interfaces/Location'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { locationColumns } from '../../common/variables/location'
import { AdminLocationService, LOCATION_PAGE_LIMIT, useAdminLocationState } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'
import LocationDrawer, { LocationDrawerMode } from './LocationDrawer'

interface Props {
  className?: string
  search: string
}

const LocationTable = ({ className, search }: Props) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(LOCATION_PAGE_LIMIT)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [openLocationDrawer, setOpenLocationDrawer] = useState(false)
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

  useEffect(() => {
    if (adminLocationState.fetched.value) {
      AdminLocationService.fetchAdminLocations(search, page, sortField, fieldOrder)
    }
  }, [fieldOrder])

  const submitRemoveLocation = async () => {
    await AdminLocationService.removeLocation(locationId)
    setOpenConfirm(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleOpenLocationDrawer =
    (open: boolean, location: Location) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }
      setLocationAdmin(location)
      setOpenLocationDrawer(open)
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
          <a href="#" className={styles.actionStyle} onClick={handleOpenLocationDrawer(true, el)}>
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setLocationId(id)
              setLocationName(name)
              setOpenConfirm(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
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
            label={t('admin:components.location.featured')}
            //  onClick={handleClick}
          />
        )}
        {el.isLobby && (
          <Chip
            avatar={<Avatar>L</Avatar>}
            label={t('admin:components.location.lobby')}
            // onClick={handleClick}
          />
        )}
      </div>,
      <div>
        {/**@ts-ignore*/}
        {el.location_setting?.instanceMediaChatEnabled
          ? t('admin:components.common.yes')
          : t('admin:components.common.no')}
      </div>,
      <div>
        {/**@ts-ignore*/}
        {el.location_setting?.videoEnabled ? t('admin:components.common.yes') : t('admin:components.common.no')}
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
      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.location.confirmLocationDelete')} '${locationName}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitRemoveLocation}
      />
      <LocationDrawer
        open={openLocationDrawer}
        mode={LocationDrawerMode.ViewEdit}
        selectedLocation={locationAdmin}
        onClose={() => setOpenLocationDrawer(false)}
      />
    </Box>
  )
}

export default LocationTable
