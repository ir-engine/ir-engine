import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'
import Checkbox from '@etherealengine/ui/src/Checkbox'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { AvatarColumn, avatarColumns, AvatarData } from '../../common/variables/avatar'
import { AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import { AdminAvatarState } from '../../services/AvatarService'
import { AdminAvatarService } from '../../services/AvatarService'
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
  const avatarData = useHookstate<AvatarInterface | null>(null)

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

  const createData = (el: AvatarInterface): AvatarData => {
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
      thumbnail: (
        <img style={{ maxHeight: '50px' }} src={el.thumbnailResource?.LOD0_url + '?' + new Date().getTime()} alt="" />
      ),
      action: (
        <>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              avatarData.set(el)
              openAvatarDrawer.set(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            href="#"
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
