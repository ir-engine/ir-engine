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

import { ConfirmProvider } from 'material-ui-confirm'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { AuthState } from '../../../user/services/AuthService'
import Search from '../../common/Search'
import { AdminInviteService } from '../../services/InviteService'
import { AdminUserService, AdminUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'
import AdminInvites from './AdminInvites'
import CreateInviteModal from './CreateInviteModal'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <Box p={3} className={styles.tabpanelRoot}>
          {children}
        </Box>
      )}
    </div>
  )
}
const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

const InvitesConsole = () => {
  const [refetch, setRefetch] = React.useState(false)
  const [value, setValue] = React.useState(0)
  const [search, setSearch] = React.useState('')
  const [createInviteModalOpen, setCreateInviteModalOpen] = React.useState(false)
  const [deleteMultiInviteModalOpen, setDeleteMultiInviteModalOpen] = React.useState(false)
  const [selectedInviteIds, setSelectedInviteIds] = useState(() => new Set<string>())

  const handeCloseInviteModal = () => setCreateInviteModalOpen(false)
  const handleCloseDeleteMultiInviteModal = () => setDeleteMultiInviteModalOpen(false)

  const adminUserState = useHookstate(getMutableState(AdminUserState))
  const authState = useHookstate(getMutableState(AuthState))
  const user = authState.user
  const { t } = useTranslation()

  const confirmMultiInviteDelete = () => {
    for (let id of selectedInviteIds) AdminInviteService.removeInvite(id)
    handleCloseDeleteMultiInviteModal()
  }

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }

  const fetchTick = () => {
    setTimeout(() => {
      setRefetch(true)
      fetchTick()
    }, 5000)
  }

  useEffect(() => {
    fetchTick()
  }, [])

  useEffect(() => {
    if (user?.id.value != null && (adminUserState.updateNeeded.value === true || refetch)) {
      AdminUserService.fetchUsersAsAdmin()
    }
    setRefetch(false)
  }, [authState.value, adminUserState.updateNeeded.value, refetch])

  const handleSearchChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <ConfirmProvider>
        <Grid container spacing={1} className={styles.mb10px}>
          <Grid item sm={8} xs={12}>
            <Search text="invite" handleChange={handleSearchChange} />
          </Grid>
          <Grid item sm={4} xs={8}>
            <Box sx={{ display: 'flex' }}>
              <Button
                className={styles.openModalBtn}
                sx={{ flexGrow: 1 }}
                type="button"
                variant="contained"
                color="primary"
                onClick={() => setCreateInviteModalOpen(true)}
              >
                {t('admin:components.invite.create')}
              </Button>

              {selectedInviteIds.size > 0 && (
                <IconButton
                  className={styles.filterButton}
                  sx={{ ml: 1 }}
                  size="small"
                  title={t('admin:components.invite.deleteSelected')}
                  onClick={() => setDeleteMultiInviteModalOpen(true)}
                  icon={<Icon type="Delete" color="info" fontSize="large" />}
                />
              )}
            </Box>
          </Grid>
        </Grid>
        <div className={styles.rootTableWithSearch}>
          <AdminInvites
            search={search}
            selectedInviteIds={selectedInviteIds}
            setSelectedInviteIds={setSelectedInviteIds}
          />
        </div>
      </ConfirmProvider>
      <CreateInviteModal open={createInviteModalOpen} onClose={handeCloseInviteModal} />
      <ConfirmDialog
        open={deleteMultiInviteModalOpen}
        description={t('admin:components.invite.confirmMultiInviteDelete')}
        onClose={handleCloseDeleteMultiInviteModal}
        onSubmit={confirmMultiInviteDelete}
      />
    </div>
  )
}

export default InvitesConsole
