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
import React from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { invitePath } from '@etherealengine/engine/src/schemas/social/invite.schema'
import Search from '../../common/Search'
import styles from '../../styles/admin.module.scss'
import AdminInvites from './AdminInvites'
import CreateInviteModal from './CreateInviteModal'

const InvitesConsole = () => {
  const search = useHookstate('')
  const createInviteModalOpen = useHookstate(false)
  const deleteMultiInviteModalOpen = useHookstate(false)
  const selectedInviteIds = useHookstate(() => new Set<string>())

  const handeCloseInviteModal = () => createInviteModalOpen.set(false)
  const handleCloseDeleteMultiInviteModal = () => deleteMultiInviteModalOpen.set(false)

  const { t } = useTranslation()
  const removeInvite = useMutation(invitePath).remove

  const confirmMultiInviteDelete = () => {
    Promise.all(Array.from(selectedInviteIds.value).map(async (id) => removeInvite(id)))
    handleCloseDeleteMultiInviteModal()
  }

  const handleSearchChange = (e: any) => {
    search.set(e.target.value)
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
                onClick={() => createInviteModalOpen.set(true)}
              >
                {t('admin:components.invite.create')}
              </Button>
              {selectedInviteIds.size.value > 0 && (
                <IconButton
                  className={styles.filterButton}
                  sx={{ ml: 1 }}
                  size="small"
                  title={t('admin:components.invite.deleteSelected')}
                  onClick={() => deleteMultiInviteModalOpen.set(true)}
                  icon={<Icon type="Delete" color="info" fontSize="large" />}
                />
              )}
            </Box>
          </Grid>
        </Grid>
        <div className={styles.rootTableWithSearch}>
          <AdminInvites
            search={search.value}
            selectedInviteIds={selectedInviteIds.value}
            setSelectedInviteIds={selectedInviteIds.set}
          />
        </div>
      </ConfirmProvider>
      <CreateInviteModal open={createInviteModalOpen.value} onClose={handeCloseInviteModal} />
      <ConfirmDialog
        open={deleteMultiInviteModalOpen.value}
        description={t('admin:components.invite.confirmMultiInviteDelete')}
        onClose={handleCloseDeleteMultiInviteModal}
        onSubmit={confirmMultiInviteDelete}
      />
    </div>
  )
}

export default InvitesConsole
