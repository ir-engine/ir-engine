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

import React, { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { Location } from '@etherealengine/common/src/interfaces/Location'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Avatar from '@etherealengine/ui/src/primitives/mui/Avatar'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Chip from '@etherealengine/ui/src/primitives/mui/Chip'

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

const transformLink = (link: string) => link.toLowerCase().replace(' ', '-')

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
      name: <a href={`/location/${transformLink(name)}`}>{name}</a>,
      sceneId: <a href={`/studio/${sceneId}`}>{sceneId}</a>,
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
