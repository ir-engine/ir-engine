import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'

import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import TableComponent from '../../common/Table'
import { AvatarColumn, avatarColumns, AvatarData } from '../../common/variables/avatar'
import { AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import { useAdminAvatarState } from '../../services/AvatarService'
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
  const { user } = useAuthState().value
  const adminAvatarState = useAdminAvatarState()
  const adminAvatars = adminAvatarState.avatars
  const adminAvatarCount = adminAvatarState.total

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(AVATAR_PAGE_LIMIT)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [avatarId, setAvatarId] = useState('')
  const [avatarName, setAvatarName] = useState('')
  const [fieldOrder, setFieldOrder] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [openAvatarDrawer, setOpenAvatarDrawer] = useState(false)
  const [avatarData, setAvatarData] = useState<AvatarInterface | null>(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    AdminAvatarService.fetchAdminAvatars(newPage, search, sortField, fieldOrder)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminAvatarState.fetched.value) {
      AdminAvatarService.fetchAdminAvatars(page, search, sortField, fieldOrder)
    }
  }, [fieldOrder])

  useEffect(() => {
    AdminAvatarService.fetchAdminAvatars(0, search, sortField, fieldOrder)
  }, [user?.id, search, adminAvatarState.updateNeeded.value])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
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
        <img style={{ maxHeight: '50px' }} src={el.thumbnailResource?.url + '?' + new Date().getTime()} alt="" />
      ),
      action: (
        <>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setAvatarData(el)
              setOpenAvatarDrawer(true)
            }}
          >
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              setAvatarId(el.id)
              setAvatarName(el.name)
              setOpenConfirm(true)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const submitRemoveAvatar = async () => {
    await AdminAvatarService.removeAdminAvatar(avatarId)
    setOpenConfirm(false)
  }

  const rows = adminAvatars.value.map((el) => {
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
        fieldOrder={fieldOrder}
        fieldOrderBy="id"
        setSortField={setSortField}
        setFieldOrder={setFieldOrder}
        rows={rows}
        column={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminAvatarCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />

      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.avatar.confirmAvatarDelete')} '${avatarName}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitRemoveAvatar}
      />

      {avatarData && openAvatarDrawer && (
        <AvatarDrawer
          open
          selectedAvatar={avatarData}
          mode={AvatarDrawerMode.ViewEdit}
          onClose={() => setOpenAvatarDrawer(false)}
        />
      )}
    </Box>
  )
}

export default AvatarTable
