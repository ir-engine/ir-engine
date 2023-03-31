import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { Group } from '@etherealengine/common/src/interfaces/Group'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/Box'

import { AuthState } from '../../../user/services/AuthService'
import TableComponent from '../../common/Table'
import { columns, Data } from '../../common/variables/group'
import { AdminGroupService, AdminGroupState, GROUP_PAGE_LIMIT } from '../../services/GroupService'
import styles from '../../styles/admin.module.scss'
import GroupDrawer, { GroupDrawerMode } from './GroupDrawer'

interface Props {
  className?: string
  search: string
}

const GroupTable = ({ className, search }: Props) => {
  const user = useHookstate(getMutableState(AuthState).user)
  const openGroupDrawer = useHookstate(false)
  const singleGroup = useHookstate<Group | null | undefined>(null)
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(GROUP_PAGE_LIMIT)
  const groupId = useHookstate('')
  const groupName = useHookstate('')
  const orderBy = useHookstate('asc')
  const sortField = useHookstate('name')
  const openConfirm = useHookstate(false)
  const adminGroupState = useHookstate(getMutableState(AdminGroupState))
  const adminGroups = adminGroupState.group
  const adminGroupCount = adminGroupState.total.value
  const { t } = useTranslation()

  const handlePageChange = (event: unknown, newPage: number) => {
    // const incDec = page < newPage ? 'increment' : 'decrement'
    AdminGroupService.getGroupService(search, newPage, sortField.value, orderBy.value)
    page.set(newPage)
  }

  useEffect(() => {
    if (adminGroupState.fetched.value) {
      AdminGroupService.getGroupService(search, page.value, sortField.value, orderBy.value)
    }
  }, [orderBy.value])

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    rowsPerPage.set(+event.target.value)
    page.set(0)
  }

  const handleGroupDrawer = (id: string) => {
    const group = adminGroups.get({ noproxy: true }).find((group) => group.id === id)
    if (group !== null) {
      singleGroup.set(group!)
      openGroupDrawer.set(true)
    }
  }

  const handleOpenConfirm = (id: string) => {
    groupId.set(id)
    openConfirm.set(true)
  }

  const deleteGroupHandler = () => {
    openConfirm.set(false)
    AdminGroupService.deleteGroupByAdmin(groupId.value)
  }

  useEffect(() => {
    //if (adminGroupState.updateNeeded.value && user.id.value) {
    //  GroupService.getGroupService(null)
    // } else {
    AdminGroupService.getGroupService(search, 0, sortField.value, orderBy.value)
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
            <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
          </a>
          <a
            href="#"
            className={styles.actionStyle}
            onClick={() => {
              handleOpenConfirm(id)
              groupName.set(name)
            }}
          >
            <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
          </a>
        </>
      )
    }
  }

  const rows = adminGroups.get({ noproxy: true }).map((el) => {
    return createData(el.id, el.name, el.description!)
  })

  return (
    <Box className={className}>
      <TableComponent
        allowSort={false}
        fieldOrder={orderBy.value}
        setSortField={sortField.set}
        setFieldOrder={orderBy.set}
        rows={rows}
        column={columns}
        page={page.value}
        rowsPerPage={rowsPerPage.value}
        count={adminGroupCount}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('admin:components.group.confirmGroupDelete')} '${groupName.value}'?`}
        onClose={() => openConfirm.set(false)}
        onSubmit={deleteGroupHandler}
      />
      {singleGroup.value && openGroupDrawer.value && (
        <GroupDrawer
          open
          selectedGroup={singleGroup.value}
          mode={GroupDrawerMode.ViewEdit}
          onClose={() => openGroupDrawer.set(false)}
        />
      )}
    </Box>
  )
}

export default GroupTable
