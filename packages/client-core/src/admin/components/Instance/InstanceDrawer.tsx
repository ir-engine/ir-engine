import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import ConfirmDialog from '../../../common/components/ConfirmDialog'
import DrawerView from '../../common/DrawerView'
import TableComponent from '../../common/Table'
import { instanceUsersColumns } from '../../common/variables/instance'
import {
  AdminInstanceUserService,
  AdminInstanceUserState,
  INSTANCE_USERS_PAGE_LIMIT
} from '../../services/InstanceService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  selectedInstance?: Instance
  onClose: () => void
}

const INFINITY = 'INFINITY'

const InstanceDrawer = ({ open, selectedInstance, onClose }: Props) => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(INSTANCE_USERS_PAGE_LIMIT)
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('createdAt')

  const openKickDialog = useHookstate(false)
  const kickData = useHookstate({
    userId: '' as UserInterface['id'],
    instanceId: '',
    duration: '8'
  })

  const { t } = useTranslation()

  const adminInstanceUserState = useHookstate(getMutableState(AdminInstanceUserState))

  useEffect(() => {
    if (!selectedInstance) return
    AdminInstanceUserService.fetchUsersInInstance(selectedInstance.id)
  }, [selectedInstance])

  const createData = (id: UserInterface['id'], name: UserInterface['name']) => ({
    id,
    name,
    action: (
      <>
        <Button
          className={styles.actionStyle}
          onClick={() => {
            kickData.merge({ userId: id, instanceId: selectedInstance!.id })
            openKickDialog.set(true)
          }}
        >
          <span className={styles.spanWhite}>{t('admin:components.common.kick')}</span>
        </Button>
        <Button
          className={styles.actionStyle}
          onClick={() => {
            kickData.merge({ userId: id, instanceId: selectedInstance!.id, duration: INFINITY })
            openKickDialog.set(true)
          }}
        >
          <span className={styles.spanWhite}>{t('admin:components.common.ban')}</span>
        </Button>
      </>
    )
  })

  const handleSubmitKickUser = async () => {
    if (!kickData.value.duration || !selectedInstance) {
      return
    }
    await AdminInstanceUserService.kickUser({ ...kickData.value })
    await AdminInstanceUserService.fetchUsersInInstance(selectedInstance.id)
    openKickDialog.set(false)
    if (kickData.value.duration === INFINITY) {
      kickData.merge({ duration: '8' })
    }
  }

  const rows = adminInstanceUserState.value.users.map((el) => createData(el.id, el.name))

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{selectedInstance?.ipAddress}</DialogTitle>
        <Grid container spacing={5} className={styles.mb15px}>
          <TableComponent
            allowSort={false}
            fieldOrder={fieldOrder.value}
            setSortField={sortField.set}
            setFieldOrder={fieldOrder.set}
            rows={rows}
            column={instanceUsersColumns}
            page={page.value}
            rowsPerPage={rowsPerPage.value}
            count={adminInstanceUserState.total.value}
            handlePageChange={() => {}}
            handleRowsPerPageChange={() => {}}
          />
        </Grid>
      </Container>
      <ConfirmDialog
        open={openKickDialog.value}
        onSubmit={handleSubmitKickUser}
        onClose={() => openKickDialog.set(false)}
        description={
          <Box>
            {kickData.value.duration === INFINITY ? (
              <span>{t('admin:components.instance.confirmUserBan')}</span>
            ) : (
              <InputText
                name="kickDuration"
                label={t('admin:components.instance.kickDuration')}
                value={kickData.value.duration}
                onChange={(event) => kickData.merge({ duration: event.target.value })}
              />
            )}
          </Box>
        }
      />
    </DrawerView>
  )
}

export default InstanceDrawer
