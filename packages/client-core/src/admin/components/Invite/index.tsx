import { ConfirmProvider } from 'material-ui-confirm'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'

import { useAuthState } from '../../../user/services/AuthService'
import ConfirmDialog from '../../common/ConfirmDialog'
import Search from '../../common/Search'
import { AdminInviteService, useAdminInviteState } from '../../services/InviteService'
import { AdminUserService, useUserState } from '../../services/UserService'
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

  const adminUserState = useUserState()
  const user = useAuthState().user
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
  }, [useAuthState(), adminUserState.updateNeeded.value, refetch])

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
                >
                  <DeleteIcon color="info" fontSize="large" />
                </IconButton>
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
