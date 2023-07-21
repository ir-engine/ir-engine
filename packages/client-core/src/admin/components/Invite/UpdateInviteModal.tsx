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

import classNames from 'classnames'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { EMAIL_REGEX, PHONE_REGEX } from '@etherealengine/common/src/constants/IdConstants'
import { InviteInterface } from '@etherealengine/common/src/interfaces/Invite'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import FormControlLabel from '@etherealengine/ui/src/primitives/mui/FormControlLabel'
import FormGroup from '@etherealengine/ui/src/primitives/mui/FormGroup'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Tab from '@etherealengine/ui/src/primitives/mui/Tab'
import Tabs from '@etherealengine/ui/src/primitives/mui/Tabs'

import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import { NotificationService } from '../../../common/services/NotificationService'
import DrawerView from '../../common/DrawerView'
import { AdminInstanceService, AdminInstanceState } from '../../services/InstanceService'
import { AdminInviteService } from '../../services/InviteService'
import { AdminLocationService, AdminLocationState } from '../../services/LocationService'
import { AdminSceneService, AdminSceneState } from '../../services/SceneService'
import { AdminUserService, AdminUserState } from '../../services/UserService'
import styles from '../../styles/admin.module.scss'

interface Props {
  open: boolean
  onClose: () => void
  invite: InviteInterface
}

const INVITE_TYPE_TAB_MAP = {
  0: 'new-user',
  1: 'location',
  2: 'instance',
  3: 'friend',
  4: 'group',
  5: 'party'
}

const UpdateInviteModal = ({ open, onClose, invite }: Props) => {
  const inviteTypeTab = useHookstate(0)
  const textValue = useHookstate('')
  const makeAdmin = useHookstate(false)
  const oneTimeUse = useHookstate(true)
  const locationId = useHookstate('')
  const instanceId = useHookstate('')
  const userInviteCode = useHookstate('')
  const spawnPointUUID = useHookstate('')
  const setSpawn = useHookstate(false)
  const spawnTypeTab = useHookstate(0)
  const timed = useHookstate(false)
  const startTime = useHookstate<Dayjs>(dayjs(null))
  const endTime = useHookstate<Dayjs>(dayjs(null))
  const { t } = useTranslation()
  const adminLocationState = useHookstate(getMutableState(AdminLocationState))
  const adminInstanceState = useHookstate(getMutableState(AdminInstanceState))
  const adminUserState = useHookstate(getMutableState(AdminUserState))
  const adminSceneState = useHookstate(getMutableState(AdminSceneState))
  const adminLocations = adminLocationState.locations
  const adminInstances = adminInstanceState.instances
  const adminUsers = adminUserState.users
  const spawnPoints = adminSceneState.singleScene?.scene?.entities.value
    ? Object.entries(adminSceneState.singleScene.scene.entities.value).filter(([, value]) =>
        value.components.find((component) => component.name === 'spawn-point')
      )
    : []

  useEffect(() => {
    console.log('DEBUG : invite changed', invite)
    AdminLocationService.fetchAdminLocations()
    AdminInstanceService.fetchAdminInstances()
    AdminUserService.setSkipGuests(true)
    AdminUserService.fetchUsersAsAdmin()
    inviteTypeTab.set(
      invite.inviteType === 'new-user'
        ? 0
        : invite.inviteType === 'location'
        ? 1
        : invite.inviteType === 'instance'
        ? 2
        : 0
    )
    if (invite.token) textValue.set(invite.token)
    if (invite.inviteeId) {
      const userMatch = adminUsers.find((user) => user.id.value === invite.inviteeId)
      if (userMatch && userMatch.inviteCode.value) textValue.set(userMatch.inviteCode.value)
      else textValue.set('')
    }
    if (invite.makeAdmin) makeAdmin.set(Boolean(invite.makeAdmin))
    if (invite.deleteOnUse) oneTimeUse.set(Boolean(invite.deleteOnUse))
    if (invite.inviteType === 'location' && invite.targetObjectId)
      handleLocationChange({ target: { value: invite.targetObjectId } })
    if (invite.inviteType === 'instance' && invite.targetObjectId)
      handleInstanceChange({ target: { value: invite.targetObjectId } })
    if (invite.spawnType) {
      setSpawn.set(true)
      if (invite.spawnType === 'inviteCode' && invite.spawnDetails) {
        spawnTypeTab.set(0)
        userInviteCode.set(
          typeof invite.spawnDetails === 'string'
            ? JSON.parse(invite.spawnDetails).inviteCode
            : invite.spawnDetails.inviteCode
        )
      }
      if (invite.spawnType === 'spawnPoint' && invite.spawnDetails) {
        spawnTypeTab.set(1)
        const uuid =
          typeof invite.spawnDetails === 'string'
            ? JSON.parse(invite.spawnDetails).spawnPoint
            : invite.spawnDetails.spawnPoint
        spawnPointUUID.set(
          typeof invite.spawnDetails === 'string'
            ? JSON.parse(invite.spawnDetails).spawnPoint
            : invite.spawnDetails.spawnPoint
        )
      }
    }
    if (invite.timed || invite.timed === 1) {
      timed.set(true)
      startTime.set(dayjs(invite.startTime))
      endTime.set(dayjs(invite.endTime))
    }
  }, [invite])

  const handleChangeInviteTypeTab = (event: React.SyntheticEvent, newValue: number) => {
    inviteTypeTab.set(newValue)
  }

  const locationMenu: InputMenuItem[] = adminLocations.map((el) => {
    return {
      value: `${el.id.value}`,
      label: `${el.name.value} (${el.sceneId.value})`
    }
  })

  const instanceMenu: InputMenuItem[] = adminInstances.map((el) => {
    return {
      value: `${el.id.value}`,
      label: `${el.id.value} (${el.location.name.value})`
    }
  })

  const userMenu: InputMenuItem[] = adminUsers.map((el) => {
    return {
      value: `${el.inviteCode.value}`,
      label: `${el.name.value} (${el.inviteCode.value})`
    }
  })

  const spawnPointMenu: InputMenuItem[] = spawnPoints.map(([id, value]) => {
    const transform = value.components.find((component) => component.name === 'transform')
    if (transform) {
      const position = transform.props.position
      return {
        value: `${id}`,
        label: `${id} (x: ${position.x}, y: ${position.y}, z: ${position.z})`
      }
    }
    return {
      value: `${id}`,
      label: `${id}`
    }
  })

  const handleChangeSpawnTypeTab = (event: React.SyntheticEvent, newValue: number) => {
    spawnTypeTab.set(newValue)
  }

  const handleLocationChange = (e) => {
    locationId.set(e.target.value)
    const location = adminLocations.find((location) => location.id.value === e.target.value)
    if (location && location.sceneId.value) {
      const sceneName = location.sceneId.value.split('/')
      AdminSceneService.fetchAdminScene(sceneName[0], sceneName[1])
    }
  }

  const handleInstanceChange = (e) => {
    instanceId.set(e.target.value)
    const instance = adminInstances.find((instance) => instance.id.value === e.target.value)
    if (instance) {
      const location = adminLocations.find((location) => location.id.value === instance.locationId.value)
      if (location) {
        const sceneName = location.sceneId.value.split('/')
        AdminSceneService.fetchAdminScene(sceneName[0], sceneName[1])
      }
    }
  }

  const handleUserChange = (e) => {
    userInviteCode.set(e.target.value)
  }

  const handleSpawnPointChange = (e) => {
    spawnPointUUID.set(e.target.value)
  }

  const submitInvite = async (event: React.SyntheticEvent) => {
    const target = textValue.value
    try {
      const inviteType = INVITE_TYPE_TAB_MAP[inviteTypeTab.value]
      const isPhone = PHONE_REGEX.test(target)
      const isEmail = EMAIL_REGEX.test(target)
      const sendData = {
        id: invite.id,
        inviteType: inviteType,
        inviteeId: invite.inviteeId,
        passcode: invite.passcode,
        token: target.length === 8 ? null : target,
        inviteCode: target.length === 8 ? target : null,
        identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
        targetObjectId: instanceId.value || locationId.value || null,
        createdAt: invite.createdAt || new Date().toJSON(),
        updatedAt: invite.updatedAt || new Date().toJSON(),
        makeAdmin: makeAdmin.value,
        deleteOnUse: oneTimeUse.value,
        invitee: undefined,
        user: undefined,
        userId: invite.userId
      } as InviteInterface
      if (setSpawn.value && spawnTypeTab.value === 0 && userInviteCode.value) {
        sendData.spawnType = 'inviteCode'
        sendData.spawnDetails = { inviteCode: userInviteCode.value }
      } else if (setSpawn.value && spawnTypeTab.value === 1 && spawnPointUUID.value) {
        sendData.spawnType = 'spawnPoint'
        sendData.spawnDetails = { spawnPoint: spawnPointUUID.value }
      }
      sendData.timed = timed.value && (startTime.value != null || endTime.value != null)
      if (sendData.timed) {
        sendData.startTime = startTime.value?.toDate()
        sendData.endTime = endTime.value?.toDate()
      }
      await AdminInviteService.updateInvite(invite.id, sendData)
      instanceId.set('')
      locationId.set('')
      textValue.set('')
      makeAdmin.set(false)
      oneTimeUse.set(true)
      userInviteCode.set('')
      setSpawn.set(false)
      spawnPointUUID.set('')
      spawnTypeTab.set(0)
      inviteTypeTab.set(0)
      timed.set(false)
      startTime.set(dayjs(null))
      endTime.set(dayjs(null))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
    setTimeout(() => AdminInviteService.fetchAdminInvites(), 500)
    onClose()
  }

  const disableSendButton = (): boolean => {
    return (
      textValue.value.length === 0 ||
      (inviteTypeTab.value === 1 && locationId.value.length === 0) ||
      (inviteTypeTab.value === 2 && instanceId.value.length === 0)
    )
  }

  return (
    <DrawerView open={open} onClose={onClose}>
      <Container maxWidth="sm" className={styles.mt20}>
        <DialogTitle className={styles.textAlign}>{t('admin:components.invite.update')}</DialogTitle>
        <FormGroup>
          <Tabs
            value={inviteTypeTab.value}
            className={styles.marginBottom10px}
            onChange={handleChangeInviteTypeTab}
            aria-label="Invite Type"
            classes={{ root: styles.tabRoot, indicator: styles.selected }}
          >
            <Tab
              className={inviteTypeTab.value === 0 ? styles.selectedTab : styles.unselectedTab}
              label={INVITE_TYPE_TAB_MAP[0].replace('-', ' ')}
              classes={{ root: styles.tabRoot }}
            />
            <Tab
              className={inviteTypeTab.value === 1 ? styles.selectedTab : styles.unselectedTab}
              label={INVITE_TYPE_TAB_MAP[1].replace('-', ' ')}
            />
            <Tab
              className={inviteTypeTab.value === 2 ? styles.selectedTab : styles.unselectedTab}
              label={INVITE_TYPE_TAB_MAP[2].replace('-', ' ')}
            />
          </Tabs>
          <div className={styles.inputContainer}>
            <InputText
              name="urlSelect"
              label={t('admin:components.invite.singleTargetLabel')}
              placeholder={t('admin:components.invite.singleTarget')}
              value={textValue.value}
              disabled={true}
            />
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={oneTimeUse.value}
                onChange={() => {
                  oneTimeUse.set(!oneTimeUse.value)
                }}
              />
            }
            label="One-time use"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={timed.value}
                onChange={() => {
                  timed.set(!timed.value)
                }}
              />
            }
            label="Timed invite"
          />
          {timed.value && (
            <div className={styles.datePickerContainer}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <div className={styles.pickerControls}>
                  <DateTimePicker
                    label="Start Time"
                    value={startTime.value}
                    onChange={(e) => startTime.set(dayjs(e))}
                  />
                  <IconButton
                    color="primary"
                    size="small"
                    className={styles.clearTime}
                    onClick={() => startTime.set(dayjs(null))}
                    icon={<Icon type="HighlightOff" />}
                  />
                </div>
                <div className={styles.pickerControls}>
                  <DateTimePicker label="End Time" value={endTime.value} onChange={(e) => endTime.set(dayjs(e))} />
                  <IconButton
                    color="primary"
                    size="small"
                    className={styles.clearTime}
                    onClick={() => endTime.set(dayjs(null))}
                    icon={<Icon type="HighlightOff" />}
                  />
                </div>
              </LocalizationProvider>
            </div>
          )}
          {inviteTypeTab.value === 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={makeAdmin.value}
                  onChange={() => {
                    makeAdmin.set(!makeAdmin.value)
                  }}
                />
              }
              label="Make user admin"
            />
          )}
          {(inviteTypeTab.value === 1 || inviteTypeTab.value === 2) && (
            <div className={styles.marginBottom10px}>
              {inviteTypeTab.value === 1 && (
                <InputSelect
                  name="location"
                  className={classNames({
                    [styles.maxWidth90]: true,
                    [styles.inputField]: true
                  })}
                  label={t('admin:components.invite.location')}
                  value={locationId.value}
                  menu={locationMenu}
                  disabled={false}
                  onChange={handleLocationChange}
                />
              )}
              {inviteTypeTab.value === 2 && (
                <InputSelect
                  name="instance"
                  className={classNames({
                    [styles.maxWidth90]: true,
                    [styles.inputField]: true
                  })}
                  label={t('admin:components.invite.instance')}
                  value={instanceId.value}
                  menu={instanceMenu}
                  disabled={false}
                  onChange={handleInstanceChange}
                />
              )}
              {((inviteTypeTab.value === 1 && locationId.value) || (inviteTypeTab.value === 2 && instanceId.value)) && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={setSpawn.value}
                      onChange={() => {
                        setSpawn.set(!setSpawn.value)
                      }}
                    />
                  }
                  label="Spawn at position"
                />
              )}
              {setSpawn.value && (
                <Tabs
                  value={spawnTypeTab.value}
                  className={styles.marginBottom10px}
                  onChange={handleChangeSpawnTypeTab}
                  aria-label="Spawn position"
                  classes={{ root: styles.tabRoot, indicator: styles.selected }}
                >
                  <Tab
                    className={spawnTypeTab.value === 0 ? styles.selectedTab : styles.unselectedTab}
                    label="User position"
                    classes={{ root: styles.tabRoot }}
                  />
                  <Tab
                    className={spawnTypeTab.value === 1 ? styles.selectedTab : styles.unselectedTab}
                    label={'Spawn Point'}
                  />
                </Tabs>
              )}
              {setSpawn.value && spawnTypeTab.value === 0 && (
                <InputSelect
                  name="user"
                  className={classNames({
                    [styles.maxWidth90]: true,
                    [styles.inputField]: true
                  })}
                  label={t('admin:components.invite.user')}
                  value={userInviteCode.value}
                  menu={userMenu}
                  disabled={false}
                  onChange={handleUserChange}
                />
              )}
              {setSpawn.value && spawnTypeTab.value === 1 && (
                <InputSelect
                  name="spawnPoint"
                  className={classNames({
                    [styles.maxWidth90]: true,
                    [styles.inputField]: true
                  })}
                  label={t('admin:components.invite.spawnPoint')}
                  value={spawnPointUUID.value}
                  menu={spawnPointMenu}
                  disabled={false}
                  onChange={handleSpawnPointChange}
                />
              )}
            </div>
          )}
          <Button
            className={styles.submitButton}
            type="button"
            variant="contained"
            color="primary"
            disabled={disableSendButton()}
            onClick={submitInvite}
          >
            {t('admin:components.invite.update')}
          </Button>
        </FormGroup>
      </Container>
    </DrawerView>
  )
}

export default UpdateInviteModal
