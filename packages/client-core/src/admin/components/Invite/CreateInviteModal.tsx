import classNames from 'classnames'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { SendInvite } from '@etherealengine/common/src/interfaces/Invite'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/Button'
import Checkbox from '@etherealengine/ui/src/Checkbox'
import Container from '@etherealengine/ui/src/Container'
import DialogTitle from '@etherealengine/ui/src/DialogTitle'
import FormControlLabel from '@etherealengine/ui/src/FormControlLabel'
import FormGroup from '@etherealengine/ui/src/FormGroup'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import Tab from '@etherealengine/ui/src/Tab'
import Tabs from '@etherealengine/ui/src/Tabs'
import TextField from '@etherealengine/ui/src/TextField'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import { NotificationService } from '../../../common/services/NotificationService'
import { emailRegex, InviteService, phoneRegex } from '../../../social/services/InviteService'
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
}

const INVITE_TYPE_TAB_MAP = {
  0: 'new-user',
  1: 'location',
  2: 'instance',
  3: 'friend',
  4: 'group',
  5: 'party'
}

const CreateInviteModal = ({ open, onClose }: Props) => {
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
  const startTime = useHookstate<Date | null>(null)
  const endTime = useHookstate<Date | null>(null)
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
    AdminLocationService.fetchAdminLocations()
    AdminInstanceService.fetchAdminInstances()
    AdminUserService.setSkipGuests(true)
    AdminUserService.fetchUsersAsAdmin()
  }, [])

  const handleChangeInviteTypeTab = (event: React.SyntheticEvent, newValue: number) => {
    inviteTypeTab.set(newValue)
  }

  const handleTextChange = (event: React.SyntheticEvent) => {
    textValue.set((event.target as HTMLInputElement).value)
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

  const submitInvites = async (event: React.SyntheticEvent) => {
    const targets = textValue.value.split(',')
    targets.map(async (target) => {
      try {
        const inviteType = INVITE_TYPE_TAB_MAP[inviteTypeTab.value]
        const isPhone = phoneRegex.test(target)
        const isEmail = emailRegex.test(target)
        const sendData = {
          inviteType: inviteType,
          token: target.length === 8 ? null : target,
          inviteCode: target.length === 8 ? target : null,
          identityProviderType: isEmail ? 'email' : isPhone ? 'sms' : null,
          targetObjectId: instanceId.value || locationId.value || null,
          makeAdmin: makeAdmin.value,
          deleteOnUse: oneTimeUse.value
        } as SendInvite
        if (setSpawn.value && spawnTypeTab.value === 0 && userInviteCode.value) {
          sendData.spawnType = 'inviteCode'
          sendData.spawnDetails = { inviteCode: userInviteCode.value }
        } else if (setSpawn.value && spawnTypeTab.value === 1 && spawnPointUUID.value) {
          sendData.spawnType = 'spawnPoint'
          sendData.spawnDetails = { spawnPoint: spawnPointUUID.value }
        }
        sendData.timed = timed.value && (startTime.value != null || endTime.value != null)
        if (sendData.timed) {
          sendData.startTime = startTime.value
          sendData.endTime = endTime.value
        }
        await InviteService.sendInvite(sendData)
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
        startTime.set(null)
        endTime.set(null)
        return
      } catch (err) {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
      }
    })
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
        <DialogTitle className={styles.textAlign}>{t('admin:components.invite.create')}</DialogTitle>
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
              label={t('admin:components.invite.targetLabel')}
              placeholder={t('admin:components.invite.target')}
              value={textValue.value}
              onChange={handleTextChange}
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
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <div className={styles.pickerControls}>
                  <DateTimePicker
                    label="Start Time"
                    value={startTime.value}
                    onChange={(e) => startTime.set(e)}
                    renderInput={(params) => <TextField className={styles.dateTimePickerDialog} {...params} />}
                  />
                  <IconButton
                    color="primary"
                    size="small"
                    className={styles.clearTime}
                    onClick={() => startTime.set(null)}
                    icon={<Icon type="HighlightOff" />}
                  />
                </div>
                <div className={styles.pickerControls}>
                  <DateTimePicker
                    label="End Time"
                    value={endTime.value}
                    onChange={(e) => endTime.set(e)}
                    renderInput={(params) => <TextField className={styles.dateTimePickerDialog} {...params} />}
                  />
                  <IconButton
                    color="primary"
                    size="small"
                    className={styles.clearTime}
                    onClick={() => endTime.set(null)}
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
            onClick={submitInvites}
          >
            {t('admin:components.invite.submit')}
          </Button>
        </FormGroup>
      </Container>
    </DrawerView>
  )
}

export default CreateInviteModal
