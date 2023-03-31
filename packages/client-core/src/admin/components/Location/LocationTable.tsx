import React, { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { Location } from '@etherealengine/common/src/interfaces/Location'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Avatar from '@etherealengine/ui/src/Avatar'
import Box from '@etherealengine/ui/src/Box'
import Button from '@etherealengine/ui/src/Button'
import Chip from '@etherealengine/ui/src/Chip'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { locationColumns } from '../../common/variables/location'
import { AdminLocationService, AdminLocationState, LOCATION_PAGE_LIMIT } from '../../services/LocationService'
import styles from '../../styles/admin.module.scss'
import LocationDrawer, { LocationDrawerMode } from './LocationDrawer'

interface Props {
  className?: string
  search: string
}

const LocationTable = ({ className, search }: Props) => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(LOCATION_PAGE_LIMIT)
  const openConfirm = useHookstate(false)
  const locationId = useHookstate('')
  const locationName = useHookstate('')
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('name')
  const openLocationDrawer = useHookstate(false)
  const locationAdmin = useHookstate<Location | undefined>(undefined)
  const user = useHookstate(getMutableState(AuthState).user)
  const adminLocationState = useHookstate(getMutableState(AdminLocationState))
  const adminLocations = adminLocationState.locations
  const adminLocationCount = adminLocationState.total

  // Call custom hooks
  const { t } = useTranslation()

  useEffect(() => {
    AdminLocationService.fetchAdminLocations(search, 0, sortField.value, fieldOrder.value)
  }, [search, user?.id?.value, adminLocationState.updateNeeded.value])

  const handlePageChange = (event: unknown, newPage: number) => {
    //const incDec = page < newPage ? 'increment' : 'decrement'
    AdminLocationService.fetchAdminLocations(search, newPage, sortField.value, fieldOrder.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (adminLocationState.fetched.value) {
      AdminLocationService.fetchAdminLocations(search, page.value, sortField.value, fieldOrder.value)
    }
  }, [fieldOrder.value])

  const submitRemoveLocation = async () => {
    await AdminLocationService.removeLocation(locationId.value)
    openConfirm.set(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }

  const handleOpenLocationDrawer =
    (open: boolean, location: Location) => (event: React.KeyboardEvent | React.MouseEvent) => {
      event.preventDefault()
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }
      locationAdmin.set(location)
      openLocationDrawer.set(open)
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
      videoEnabled,
      action: (
        <>
          <Button className={styles.actionStyle} onClick={handleOpenLocationDrawer(true, el)}>
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </Button>
          <Button
            className={styles.actionStyle}
            onClick={() => {
              locationId.set(id)
              locationName.set(name)
              openConfirm.set(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </Button>
        </>
      )
    }
  }

  const rows = adminLocations.get({ noproxy: true }).map((el) => {
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
        {el.location_setting?.videoEnabled ? t('admin:components.common.yes') : t('admin:components.common.no')}
      </div>
    )
  })

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={locationColumns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminLocationCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.location.confirmLocationDelete')} '${locationName.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitRemoveLocation}
      />
      <LocationDrawer
        open={openLocationDrawer.value}
        mode={LocationDrawerMode.ViewEdit}
        selectedLocation={locationAdmin.value}
        onClose={() => openLocationDrawer.set(false)}
      />
    </Box>
  )
}

export default LocationTable
