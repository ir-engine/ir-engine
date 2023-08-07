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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { AvatarColumn, avatarColumns, AvatarData } from '../../common/variables/avatar'
import { AdminAvatarService, AdminAvatarState, AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import styles from '../../styles/admin.module.scss'
import AvatarDrawer, { AvatarDrawerMode } from './AvatarDrawer'

interface Props {
  className?: string
  search: string
  selectedAvatarIds: Set<string>
  setSelectedAvatarIds: any
}

const AvatarTable = ({ className, search, selectedAvatarIds, setSelectedAvatarIds }: Props) => {
  const { t } = useTranslation()
  const user = useHookstate(getMutableState(AuthState).user).value
  const adminAvatarState = useHookstate(getMutableState(AdminAvatarState))
  const adminAvatars = adminAvatarState.avatars
  const adminAvatarCount = adminAvatarState.total

  const page = useHookstate(0)
  const rowsPerPage = useHookstate(AVATAR_PAGE_LIMIT)
  const openConfirm = useHookstate(false)
  const avatarId = useHookstate('')
  const avatarName = useHookstate('')
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('name')
  const openAvatarDrawer = useHookstate(false)
  const avatarData = useHookstate<AvatarType | null>(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminAvatarService.fetchAdminAvatars(newPage, search, sortField.value, fieldOrder.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (adminAvatarState.fetched.value) {
      AdminAvatarService.fetchAdminAvatars(page.value, search, sortField.value, fieldOrder.value)
    }
  }, [fieldOrder.value])

  useEffect(() => {
    AdminAvatarService.fetchAdminAvatars(0, search, sortField.value, fieldOrder.value)
  }, [user?.id, search, adminAvatarState.updateNeeded.value])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(parseInt(event.target.value, 10))
    page.set(0)
  }

  const toggleSelection = (id: string) => {
    if (selectedAvatarIds.has(id)) {
      setSelectedAvatarIds((current) => {
        const newSet = new Set(current)
        newSet.delete(id)
        return newSet
      })
    } else {
      setSelectedAvatarIds((current) => new Set(current).add(id))
    }
  }

  const createData = (el: AvatarType): AvatarData => {
    return {
      el,
      select: (
        <>
          <Checkbox
            className={styles.checkbox}
            checked={selectedAvatarIds.has(el.id)}
            onChange={() => {
              toggleSelection(el.id)
            }}
          />
        </>
      ),
      id: el.id,
      name: el.name as string,
      owner: el.userId,
      thumbnail: (
        <img
          style={{ maxHeight: '50px' }}
          crossOrigin="anonymous"
          src={el.thumbnailResource?.url + '?' + new Date().getTime()}
          alt=""
        />
      ),
      action: (
        <>
          <a
            className={styles.actionStyle}
            onClick={() => {
              avatarData.set(el)
              openAvatarDrawer.set(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            className={styles.actionStyle}
            onClick={() => {
              avatarId.set(el.id)
              avatarName.set(el.name)
              openConfirm.set(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const submitRemoveAvatar = async () => {
    await AdminAvatarService.removeAdminAvatar(avatarId.value)
    openConfirm.set(false)
  }

  const rows = adminAvatars.get({ noproxy: true }).map((el) => {
    return createData(el)
  })

  let allSelected: boolean | undefined = undefined
  if (adminAvatars.value.length === selectedAvatarIds.size) {
    allSelected = true
  } else if (selectedAvatarIds.size === 0) {
    allSelected = false
  }

  const columns: AvatarColumn[] = [
    {
      id: 'select',
      label: (
        <Checkbox
          className={styles.checkbox}
          checked={allSelected === true}
          indeterminate={allSelected === undefined}
          onChange={(_event, checked) => {
            if (checked || allSelected === undefined) {
              const set = new Set<string>()
              adminAvatars.value.map((item) => set.add(item.id))
              setSelectedAvatarIds(set)
            } else {
              setSelectedAvatarIds(new Set<string>())
            }
          }}
        />
      ),
      minWidth: 65
    },
    ...avatarColumns
  ]

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={fieldOrder.value}
        fieldOrderBy="id"
        setSortField={sortField.set}
        setFieldOrder={fieldOrder.set}
        rows={rows}
        column={columns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminAvatarCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />

      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.avatar.confirmAvatarDelete')} '${avatarName.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={submitRemoveAvatar}
      />

      {avatarData.value && openAvatarDrawer.value && (
        <AvatarDrawer
          open
          selectedAvatar={avatarData.value}
          mode={AvatarDrawerMode.ViewEdit}
          onClose={() => openAvatarDrawer.set(false)}
        />
      )}
    </Box>
  )
}

export default AvatarTable
