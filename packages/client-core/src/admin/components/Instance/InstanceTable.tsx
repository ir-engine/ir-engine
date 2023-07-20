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

import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { Location } from '@etherealengine/common/src/interfaces/Location'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { instanceColumns, InstanceData } from '../../common/variables/instance'
import { AdminInstanceService, AdminInstanceState, INSTANCE_PAGE_LIMIT } from '../../services/InstanceService'
import styles from '../../styles/admin.module.scss'
import InstanceDrawer from './InstanceDrawer'

interface Props {
  className?: string
  search: string
}

/**
 * JSX used to display table of instance
 *
 * @param props
 * @returns DOM Element
 */
const InstanceTable = ({ className, search }: Props) => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(INSTANCE_PAGE_LIMIT)
  const refetch = useHookstate(false)
  const openConfirm = useHookstate(false)
  const instanceId = useHookstate('')
  const instanceName = useHookstate('')
  const fieldOrder = useHookstate<'asc' | 'desc'>('asc')
  const sortField = useHookstate('createdAt')
  const instanceAdmin = useHookstate<Instance | undefined>(undefined)
  const openInstanceDrawer = useHookstate(false)
  const { t } = useTranslation()

  const user = useHookstate(getMutableState(AuthState).user)
  const adminInstanceState = useHookstate(getMutableState(AdminInstanceState))
  const adminInstances = adminInstanceState

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminInstanceService.fetchAdminInstances(search, newPage, sortField.value, fieldOrder.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (adminInstanceState.fetched.value) {
      AdminInstanceService.fetchAdminInstances(search, page.value, sortField.value, fieldOrder.value)
    }
  }, [fieldOrder.value])

  const submitRemoveInstance = async () => {
    await AdminInstanceService.removeInstance(instanceId.value)
    openConfirm.set(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }
  const isMounted = useRef(false)

  const fetchTick = () => {
    setTimeout(() => {
      if (!isMounted.current) return
      refetch.set(true)
      fetchTick()
    }, 5000)
  }

  const handleOpenInstanceDrawer =
    (open: boolean, instance: Instance) => (event: React.KeyboardEvent | React.MouseEvent) => {
      event.preventDefault()
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }
      instanceAdmin.set(instance)
      openInstanceDrawer.set(open)
    }

  useEffect(() => {
    isMounted.current = true
    fetchTick()
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!isMounted.current) return
    if ((user.id.value && adminInstances.updateNeeded.value) || refetch.value) {
      AdminInstanceService.fetchAdminInstances(search, page.value, sortField.value, fieldOrder.value)
    }
    refetch.set(false)
  }, [user, adminInstanceState.updateNeeded.value, refetch.value])

  const createData = (
    el: Instance,
    id: string,
    ipAddress: string,
    currentUsers: Number,
    channelId: string,
    podName: string,
    locationId?: Location
  ): InstanceData => {
    return {
      el,
      id,
      ipAddress,
      currentUsers,
      locationId: locationId?.name || '',
      channelId,
      podName,
      action: (
        <>
          <Button className={styles.actionStyle} onClick={handleOpenInstanceDrawer(true, el)}>
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </Button>
          <Button
            className={styles.actionStyle}
            onClick={() => {
              instanceId.set(id)
              instanceName.set(ipAddress)
              openConfirm.set(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </Button>
        </>
      )
    }
  }

  const rows = adminInstances.instances.value.map((el: Instance) =>
    createData({ ...el }, el.id, el.ipAddress, el.currentUsers, el.channelId || '', el.podName || '', el.location)
  )

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={instanceColumns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminInstances.total.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.instance.confirmInstanceDelete')} '${instanceName.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitRemoveInstance}
      />
      <InstanceDrawer
        open={openInstanceDrawer.value}
        selectedInstance={instanceAdmin.value}
        onClose={() => openInstanceDrawer.set(false)}
      />
    </Box>
  )
}

export default InstanceTable
