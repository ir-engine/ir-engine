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

import React from 'react'
import { useTranslation } from 'react-i18next'

import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'

import { useFind, useMutation } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { instanceAttendancePath } from '@etherealengine/engine/src/schemas/networking/instance-attendance.schema'
import { InstanceID, InstanceType } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { userKickPath } from '@etherealengine/engine/src/schemas/user/user-kick.schema'
import { UserID, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { toDateTimeSql } from '@etherealengine/server-core/src/util/datetime-sql'
import ConfirmDialog from '../../../common/components/ConfirmDialog'
import { NotificationService } from '../../../common/services/NotificationService'
import DrawerView from '../../common/DrawerView'
import TableComponent from '../../common/Table'
import { instanceUsersColumns } from '../../common/variables/instance'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  selectedInstance?: InstanceType
  onClose: () => void
}

const INFINITY = 'INFINITY'

const useUsersInInstance = (instanceId: InstanceID) => {
  const instanceAttendances = useFind(instanceAttendancePath, {
    query: {
      instanceId
    }
  })

  const userIds = instanceAttendances.data.map((d: any) => d.userId)
  return useFind(userPath, {
    query: {
      id: {
        $in: userIds
      },
      $sort: {
        createdAt: 1
      },
      $limit: 10
    }
  })
}

const useKickUser = () => {
  const createUserKick = useMutation(userKickPath).create

  return (kickData: { userId: UserID; instanceId: InstanceID; duration: string }) => {
    const duration = new Date()
    if (kickData.duration === 'INFINITY') {
      duration.setFullYear(duration.getFullYear() + 10) // ban for 10 years
    } else {
      duration.setHours(duration.getHours() + parseInt(kickData.duration, 10))
    }
    createUserKick({ ...kickData, duration: toDateTimeSql(duration) })
    NotificationService.dispatchNotify(`user was kicked`, { variant: 'default' })
  }
}

const InstanceDrawer = ({ open, selectedInstance, onClose }: Props) => {
  const { t } = useTranslation()

  const openKickDialog = useHookstate(false)
  const kickData = useHookstate({
    userId: '' as UserID,
    instanceId: '' as InstanceID,
    duration: '8'
  })

  const instanceUsersQuery = useUsersInInstance(selectedInstance?.id ?? ('' as InstanceID))
  const kickUser = useKickUser()

  const createData = (id: UserID, name: string) => ({
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
    await kickUser(kickData.value)
    openKickDialog.set(false)
    if (kickData.value.duration === INFINITY) {
      kickData.merge({ duration: '8' })
    }
  }

  const rows = instanceUsersQuery.data.map((el) => createData(el.id, el.name))

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{selectedInstance?.ipAddress}</DialogTitle>
        <Grid container spacing={5} className={styles.mb15px}>
          <TableComponent query={instanceUsersQuery} rows={rows} column={instanceUsersColumns} />
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
