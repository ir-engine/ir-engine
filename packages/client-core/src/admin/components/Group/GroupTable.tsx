import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Group } from '@xrengine/common/src/interfaces/Group'

import Box from '@mui/material/Box'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmModal from '../../common/ConfirmModal'
import TableComponent from '../../common/Table'
import { columns, Data } from '../../common/variables/group'
import { AdminGroupService, GROUP_PAGE_LIMIT, useAdminGroupState } from '../../services/GroupService'
import styles from '../../styles/admin.module.scss'
import GroupDrawer, { GroupDrawerMode } from './GroupDrawer'

interface Props {
  className?: string
  search: string
}

const GroupTable = ({ className, search }: Props) => {
  const user = useAuthState().user
  const [openGroupDrawer, setOpenGroupDrawer] = useState(false)
  const [singleGroup, setSingleGroup] = useState<Group>(null!)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(GROUP_PAGE_LIMIT)
  const [groupId, setGroupId] = useState('')
  const [groupName, setGroupName] = useState('')
  const [orderBy, setOrderBy] = useState('asc')
  const [sortField, setSortField] = useState('name')
  const [showWarning, setShowWarning] = useState(false)
  const adminGroupState = useAdminGroupState()
  const adminGroups = adminGroupState.group
  const adminGroupCount = adminGroupState.total.value
  const { t } = useTranslation()

  const handlePageChange = (event: unknown, newPage: number) => {
    // const incDec = page < newPage ? 'increment' : 'decrement'
    AdminGroupService.getGroupService(search, newPage, sortField, orderBy)
    setPage(newPage)
  }

  useEffect(() => {
    if (adminGroupState.fetched.value) {
      AdminGroupService.getGroupService(search, page, sortField, orderBy)
    }
  }, [orderBy])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleGroupDrawer = (id: string) => {
    const group = adminGroups.value.find((group) => group.id === id)
    if (group !== null) {
      setSingleGroup(group!)
      setOpenGroupDrawer(true)
    }
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
  }

  const handleShowWarning = (id: string) => {
    setGroupId(id)
    setShowWarning(true)
  }

  const deleteGroupHandler = () => {
    setShowWarning(false)
    AdminGroupService.deleteGroupByAdmin(groupId)
  }

  useEffect(() => {
    //if (adminGroupState.updateNeeded.value && user.id.value) {
    //  GroupService.getGroupService(null)
    // } else {
    AdminGroupService.getGroupService(search, 0, sortField, orderBy)
    // }
  }, [adminGroupState.updateNeeded.value, user, search])

  const createData = (id: any, name: any, description: string): Data => {
    return {
      id,
      name,
      description,
      action: (
        <>
          <a href="#" className={styles.actionStyle} onClick={() => handleGroupDrawer(id)}>
            <span className={styles.spanWhite}>{t('admin:components.group.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              handleShowWarning(id)
              setGroupName(name)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.group.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = adminGroups.value.map((el) => {
    return createData(el.id, el.name, el.description!)
  })

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={orderBy}
        setSortField={setSortField}
        setFieldOrder={setOrderBy}
        rows={rows}
        column={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminGroupCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmModal
        open={showWarning}
        description={`${t('admin:components.group.confirmGroupDelete')} '${groupName}'?`}
        onClose={handleCloseWarning}
        onSubmit={deleteGroupHandler}
      />
      {singleGroup && openGroupDrawer && (
        <GroupDrawer
          open
          selectedGroup={singleGroup}
          mode={GroupDrawerMode.ViewEdit}
          onClose={() => setOpenGroupDrawer(false)}
        />
      )}
    </Box>
  )
}

export default GroupTable
