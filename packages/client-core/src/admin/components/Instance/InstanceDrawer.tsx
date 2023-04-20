import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/Button'
import Container from '@etherealengine/ui/src/Container'
import DialogActions from '@etherealengine/ui/src/DialogActions'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import Grid from '@etherealengine/ui/src/Grid'

import { AuthState } from '../../../user/services/AuthService'
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

const InstanceDrawer = ({ open, selectedInstance, onClose }: Props) => {
  const page = useHookstate(0)
  const rowsPerPage = useHookstate(INSTANCE_USERS_PAGE_LIMIT)
  const fieldOrder = useHookstate('asc')
  const sortField = useHookstate('createdAt')

  const { t } = useTranslation()
  const editMode = useHookstate(false)

  const user = useHookstate(getMutableState(AuthState).user)

  const hasWriteAccess = user.scopes.get({ noproxy: true })?.find((item) => item?.type === 'location:write')

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
        <Button className={styles.actionStyle}>
          <span className={styles.spanWhite}>{t('admin:components.common.view')}</span>
        </Button>
        <Button className={styles.actionStyle}>
          <span className={styles.spanDange}>{t('admin:components.common.delete')}</span>
        </Button>
      </>
    )
  })

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
        <DialogActions>
          <Button className={styles.outlinedButton} onClick={() => {}}>
            {t('admin:components.common.kick')}
          </Button>
        </DialogActions>
      </Container>
    </DrawerView>
  )
}

export default InstanceDrawer
